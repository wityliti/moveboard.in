import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];
  const indiaCountries = ["in"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "inr",
          is_default: true,
        },
        {
          currency_code: "eur",
        },
        {
          currency_code: "usd",
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "India",
          currency_code: "inr",
          countries: indiaCountries,
          payment_providers: ["pp_system_default", "pp_razorpay_razorpay"],
        },
        {
          name: "Europe",
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const indiaRegion = regionResult[0];
  const region = regionResult[1];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: [...indiaCountries, ...countries].map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "European Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "India",
        geo_zones: [
          {
            country_code: "in",
            type: "country",
          },
        ],
      },
      {
        name: "Europe",
        geo_zones: [
          {
            country_code: "gb",
            type: "country",
          },
          {
            country_code: "de",
            type: "country",
          },
          {
            country_code: "dk",
            type: "country",
          },
          {
            country_code: "se",
            type: "country",
          },
          {
            country_code: "fr",
            type: "country",
          },
          {
            country_code: "es",
            type: "country",
          },
          {
            country_code: "it",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  const indiaServiceZone = fulfillmentSet.service_zones.find(
    (z) => z.name === "India"
  )!;
  const europeServiceZone = fulfillmentSet.service_zones.find(
    (z) => z.name === "Europe"
  )!;

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: indiaServiceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 3-5 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "inr",
            amount: 99,
          },
          {
            region_id: indiaRegion.id,
            amount: 99,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: indiaServiceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 1-2 days.",
          code: "express",
        },
        prices: [
          {
            currency_code: "inr",
            amount: 199,
          },
          {
            region_id: indiaRegion.id,
            amount: 199,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: europeServiceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: europeServiceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id", "token"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Webshop",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });

  const token = (publishableApiKey as any).token;
  if (token) {
    const fs = require("fs");
    const path = require("path");
    const storefrontEnvPath = path.resolve(
      __dirname,
      "../../../moveboard-storefront/.env.local"
    );
    if (fs.existsSync(storefrontEnvPath)) {
      let envContent = fs.readFileSync(storefrontEnvPath, "utf-8");
      envContent = envContent.replace(
        /NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*/,
        `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${token}`
      );
      fs.writeFileSync(storefrontEnvPath, envContent);
      logger.info(`Auto-updated storefront .env.local with publishable key.`);
    }
    logger.info(`Publishable API Key: ${token}`);
  }
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Standing Boards",
          is_active: true,
        },
        {
          name: "Balance Equipment",
          is_active: true,
        },
        {
          name: "Movement Accessories",
          is_active: true,
        },
        {
          name: "Bundles",
          is_active: true,
        },
        {
          name: "Wall Bars & Ladders",
          is_active: true,
        },
        {
          name: "Activity Towers",
          is_active: true,
        },
        {
          name: "Pikler & Climbing",
          is_active: true,
        },
        {
          name: "Electric Boards",
          is_active: true,
        },
        {
          name: "Training Equipment",
          is_active: true,
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Moveboard Flow — Active Standing Board",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Standing Boards")!.id,
          ],
          description:
            "The Moveboard Flow is a premium active standing board designed in India. Featuring independently moving slats on a military-grade bungee cord system, it lets you rock, tilt, and sway in all directions while working. Built from sustainably sourced hardwood with an eco-friendly finish. Make movement intuitive — not forced, not extreme, just natural.",
          handle: "moveboard-flow",
          weight: 5500,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
            },
          ],
          options: [
            {
              title: "Finish",
              values: ["Natural Birch", "Walnut"],
            },
          ],
          variants: [
            {
              title: "Natural Birch",
              sku: "FLOW-BIRCH",
              options: {
                Finish: "Natural Birch",
              },
              prices: [
                {
                  amount: 14999,
                  currency_code: "inr",
                },
                {
                  amount: 169,
                  currency_code: "eur",
                },
                {
                  amount: 179,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Walnut",
              sku: "FLOW-WALNUT",
              options: {
                Finish: "Walnut",
              },
              prices: [
                {
                  amount: 17999,
                  currency_code: "inr",
                },
                {
                  amount: 199,
                  currency_code: "eur",
                },
                {
                  amount: 219,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Moveboard Flow Pro — Active Standing Board",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Standing Boards")!.id,
          ],
          description:
            "Everything you love about the Flow, elevated. The Flow Pro features a wider deck for larger feet, a cork-composite top surface for superior grip, and reinforced hardwood construction rated up to 150kg. Ideal for taller users and those who want a more pronounced range of motion. Includes anti-fatigue foot mapping zones.",
          handle: "moveboard-flow-pro",
          weight: 7000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
            },
          ],
          options: [
            {
              title: "Finish",
              values: ["Natural Birch", "Walnut", "Charcoal"],
            },
          ],
          variants: [
            {
              title: "Natural Birch",
              sku: "FLOWPRO-BIRCH",
              options: {
                Finish: "Natural Birch",
              },
              prices: [
                {
                  amount: 21999,
                  currency_code: "inr",
                },
                {
                  amount: 249,
                  currency_code: "eur",
                },
                {
                  amount: 269,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Walnut",
              sku: "FLOWPRO-WALNUT",
              options: {
                Finish: "Walnut",
              },
              prices: [
                {
                  amount: 24999,
                  currency_code: "inr",
                },
                {
                  amount: 279,
                  currency_code: "eur",
                },
                {
                  amount: 299,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Charcoal",
              sku: "FLOWPRO-CHARCOAL",
              options: {
                Finish: "Charcoal",
              },
              prices: [
                {
                  amount: 24999,
                  currency_code: "inr",
                },
                {
                  amount: 279,
                  currency_code: "eur",
                },
                {
                  amount: 299,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Moveboard Curvy — Balance Board",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Balance Equipment")!.id,
          ],
          description:
            "A versatile curved wooden balance board inspired by Waldorf movement principles. Rock, wobble, slide, and stretch — the Curvy is a full-body balance trainer that doubles as a yoga prop, a meditation seat, and a play surface. Made from multi-layer birch plywood with a natural cork underside for floor protection. Supports up to 120kg.",
          handle: "moveboard-curvy",
          weight: 3200,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
            },
          ],
          options: [
            {
              title: "Variant",
              values: ["Natural", "Cork-Lined"],
            },
          ],
          variants: [
            {
              title: "Natural",
              sku: "CURVY-NATURAL",
              options: {
                Variant: "Natural",
              },
              prices: [
                {
                  amount: 3900,
                  currency_code: "inr",
                },
                {
                  amount: 45,
                  currency_code: "eur",
                },
                {
                  amount: 49,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Cork-Lined",
              sku: "CURVY-CORK",
              options: {
                Variant: "Cork-Lined",
              },
              prices: [
                {
                  amount: 4550,
                  currency_code: "inr",
                },
                {
                  amount: 52,
                  currency_code: "eur",
                },
                {
                  amount: 55,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Moveboard Beam — Balancing Beam",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Balance Equipment")!.id,
          ],
          description:
            "A low-profile wooden balancing beam for coordination training and active play. Ideal for developing proprioception, foot strength, and spatial awareness. Stackable modular design lets you connect multiple beams into custom courses. Rounded edges and a non-slip surface make it safe for all ages. Perfect for home, office, or clinic use.",
          handle: "moveboard-beam",
          weight: 2000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
            },
          ],
          options: [
            {
              title: "Length",
              values: ["80cm", "120cm"],
            },
          ],
          variants: [
            {
              title: "80cm",
              sku: "BEAM-80",
              options: {
                Length: "80cm",
              },
              prices: [
                {
                  amount: 2500,
                  currency_code: "inr",
                },
                {
                  amount: 29,
                  currency_code: "eur",
                },
                {
                  amount: 32,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "120cm",
              sku: "BEAM-120",
              options: {
                Length: "120cm",
              },
              prices: [
                {
                  amount: 3500,
                  currency_code: "inr",
                },
                {
                  amount: 39,
                  currency_code: "eur",
                },
                {
                  amount: 42,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Moveboard Anti-Fatigue Standing Mat",
          category_ids: [
            categoryResult.find(
              (cat) => cat.name === "Movement Accessories"
            )!.id,
          ],
          description:
            "A premium anti-fatigue mat designed as the perfect companion to your Moveboard standing board. High-density cushioned surface with terrain-inspired contours that encourage subtle foot movement and pressure point massage. Pairs seamlessly with the Flow and Flow Pro boards. Non-toxic EVA foam with a washable top layer.",
          handle: "anti-fatigue-mat",
          weight: 1800,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
            },
          ],
          options: [
            {
              title: "Color",
              values: ["Charcoal", "Stone Grey"],
            },
          ],
          variants: [
            {
              title: "Charcoal",
              sku: "MAT-CHARCOAL",
              options: {
                Color: "Charcoal",
              },
              prices: [
                {
                  amount: 2999,
                  currency_code: "inr",
                },
                {
                  amount: 35,
                  currency_code: "eur",
                },
                {
                  amount: 39,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Stone Grey",
              sku: "MAT-GREY",
              options: {
                Color: "Stone Grey",
              },
              prices: [
                {
                  amount: 2999,
                  currency_code: "inr",
                },
                {
                  amount: 35,
                  currency_code: "eur",
                },
                {
                  amount: 39,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Moveboard Workspace Bundle",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Bundles")!.id,
          ],
          description:
            "The complete active workspace setup. Includes the Moveboard Flow active standing board, an anti-fatigue standing mat, and the Curvy balance board for break-time stretching. Save 15% compared to buying individually. Everything you need to transform your standing desk into a movement station.",
          handle: "workspace-bundle",
          weight: 10500,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
            },
          ],
          options: [
            {
              title: "Board Finish",
              values: ["Natural Birch", "Walnut"],
            },
          ],
          variants: [
            {
              title: "Natural Birch",
              sku: "BUNDLE-WS-BIRCH",
              options: {
                "Board Finish": "Natural Birch",
              },
              prices: [
                {
                  amount: 18199,
                  currency_code: "inr",
                },
                {
                  amount: 209,
                  currency_code: "eur",
                },
                {
                  amount: 225,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Walnut",
              sku: "BUNDLE-WS-WALNUT",
              options: {
                "Board Finish": "Walnut",
              },
              prices: [
                {
                  amount: 21699,
                  currency_code: "inr",
                },
                {
                  amount: 239,
                  currency_code: "eur",
                },
                {
                  amount: 259,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        // --- Movemate (Canada) ---
        {
          title: "Movemate™ Active Standing Board",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Standing Boards")!.id,
          ],
          description:
            "Award-winning active standing board from Canada. Patent-pending flexible platform with independently moving slats that trace natural dynamic movements. Built from premium Baltic Birch Plywood with military-grade bungee cord configuration. Eco-friendly commercial-grade coating. Supports up to 181kg. Handcrafted in Canada. 30-day happiness promise.",
          handle: "movemate-active-standing-board",
          weight: 5500,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
            },
          ],
          options: [
            {
              title: "Variant",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "MOVEMATE-STD",
              options: {
                Variant: "Standard",
              },
              prices: [
                {
                  amount: 29999,
                  currency_code: "inr",
                },
                {
                  amount: 329,
                  currency_code: "eur",
                },
                {
                  amount: 359,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        // --- Bloon Toys (India) ---
        {
          title: "Bloon Curvy Board 2.0 — Cork-Lined Balance Board",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Balance Equipment")!.id,
          ],
          description:
            "A Waldorf-inspired curved wooden balance board with premium cork lining for floor protection and enhanced grip. Rock, wobble, slide, and stretch — perfect for open-ended play and movement exploration. Made from multi-layer birch plywood. Designed in India by Bloon Toys for ages 1.5+. Works on the foundational 'sense of balance'.",
          handle: "bloon-curvy-board-cork",
          weight: 3000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
            },
          ],
          options: [
            {
              title: "Variant",
              values: ["Cork-Lined", "Light Indigo"],
            },
          ],
          variants: [
            {
              title: "Cork-Lined",
              sku: "BLOON-CURVY-CORK",
              options: {
                Variant: "Cork-Lined",
              },
              prices: [
                {
                  amount: 4550,
                  currency_code: "inr",
                },
                {
                  amount: 52,
                  currency_code: "eur",
                },
                {
                  amount: 55,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Light Indigo",
              sku: "BLOON-CURVY-INDIGO",
              options: {
                Variant: "Light Indigo",
              },
              prices: [
                {
                  amount: 4550,
                  currency_code: "inr",
                },
                {
                  amount: 52,
                  currency_code: "eur",
                },
                {
                  amount: 55,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Bloon Original Curvy Board — Wooden Balance Board",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Balance Equipment")!.id,
          ],
          description:
            "The original Waldorf-style wooden balance board by Bloon Toys. A minimalist curved board without cork — pure birch plywood for rocking, stretching, and imaginative play. Lightweight and versatile for all ages. Made in India.",
          handle: "bloon-original-curvy-board",
          weight: 2500,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
            },
          ],
          options: [
            {
              title: "Variant",
              values: ["Natural"],
            },
          ],
          variants: [
            {
              title: "Natural",
              sku: "BLOON-CURVY-OG",
              options: {
                Variant: "Natural",
              },
              prices: [
                {
                  amount: 3900,
                  currency_code: "inr",
                },
                {
                  amount: 45,
                  currency_code: "eur",
                },
                {
                  amount: 49,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Bloon Zen Blocks — Balancing Blocks",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Balance Equipment")!.id,
          ],
          description:
            "Handcrafted wooden balancing blocks for mindful play and focus. Stack, balance, and create — a meditative toy for all ages. Made from solid wood with smooth, rounded edges. Designed by Bloon Toys, India.",
          handle: "bloon-zen-blocks",
          weight: 500,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
            },
          ],
          options: [
            {
              title: "Variant",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "BLOON-ZEN",
              options: {
                Variant: "Standard",
              },
              prices: [
                {
                  amount: 1250,
                  currency_code: "inr",
                },
                {
                  amount: 15,
                  currency_code: "eur",
                },
                {
                  amount: 16,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Bloon Pikler MAX — Transformable Jungle Gym",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Pikler & Climbing")!.id,
          ],
          description:
            "A transformable Pikler triangle that converts into multiple configurations for climbing, hanging, and creative play. Sturdy birch plywood construction rated for daily use. Foldable for storage. Compatible with slide, rope ladder, disc swing, and trapeze bar attachments. Made in India by Bloon Toys. Ages 6m+.",
          handle: "bloon-pikler-max",
          weight: 12000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
            },
          ],
          options: [
            {
              title: "Variant",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "BLOON-PIKLER-MAX",
              options: {
                Variant: "Standard",
              },
              prices: [
                {
                  amount: 21950,
                  currency_code: "inr",
                },
                {
                  amount: 249,
                  currency_code: "eur",
                },
                {
                  amount: 269,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Bloon Pikler MINI — Starter Pikler Triangle",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Pikler & Climbing")!.id,
          ],
          description:
            "The perfect first climbing triangle for toddlers. Compact, safe, and beautifully made from birch plywood. Encourages motor skill development through self-directed climbing. Foldable for easy storage. Made in India by Bloon Toys. Ages 6m–4y.",
          handle: "bloon-pikler-mini",
          weight: 7000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
            },
          ],
          options: [
            {
              title: "Variant",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "BLOON-PIKLER-MINI",
              options: {
                Variant: "Standard",
              },
              prices: [
                {
                  amount: 10450,
                  currency_code: "inr",
                },
                {
                  amount: 119,
                  currency_code: "eur",
                },
                {
                  amount: 129,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Bloon Pikler Slide — Reversible Rock Climbing Face",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Pikler & Climbing")!.id,
          ],
          description:
            "Dual-purpose slide attachment for Bloon Pikler MINI or MAX. One side is a smooth wooden slide, the other features rock climbing holds. Adds versatility and challenge to your Pikler setup. Made in India by Bloon Toys.",
          handle: "bloon-pikler-slide",
          weight: 5000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
            },
          ],
          options: [
            {
              title: "Variant",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "BLOON-SLIDE",
              options: {
                Variant: "Standard",
              },
              prices: [
                {
                  amount: 6750,
                  currency_code: "inr",
                },
                {
                  amount: 79,
                  currency_code: "eur",
                },
                {
                  amount: 85,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        // --- Calineo (India) ---
        {
          title: "Calineo Swedish Ladder — Wall-Mounted Home Gym",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Wall Bars & Ladders")!
              .id,
          ],
          description:
            "Professional-grade wall-mounted Swedish ladder for full-body strength training, stretching, and flexibility. Calisthenics-inspired design built for Indian homes. 120kg capacity. Suitable for ages 1–100. Designed by calisthenics coaches. Made in India by Calineo.",
          handle: "calineo-swedish-ladder",
          weight: 25000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
            },
          ],
          options: [
            {
              title: "Variant",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "CALINEO-LADDER",
              options: {
                Variant: "Standard",
              },
              prices: [
                {
                  amount: 26000,
                  currency_code: "inr",
                },
                {
                  amount: 299,
                  currency_code: "eur",
                },
                {
                  amount: 319,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Calineo Aero Playtower — Indoor Activity Station",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Activity Towers")!.id,
          ],
          description:
            "Indoor activity station with toddler-safe design for climbing, swinging, and active play. Compact footprint designed for Indian apartments. Encourages motor skills and spatial awareness. Made in India by Calineo.",
          handle: "calineo-aero-playtower",
          weight: 20000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
            },
          ],
          options: [
            {
              title: "Variant",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "CALINEO-AERO",
              options: {
                Variant: "Standard",
              },
              prices: [
                {
                  amount: 29000,
                  currency_code: "inr",
                },
                {
                  amount: 329,
                  currency_code: "eur",
                },
                {
                  amount: 355,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Calineo Titan Tower — Professional Calisthenics Station",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Activity Towers")!.id,
          ],
          description:
            "Heavy-duty adjustable-height calisthenics training tower. 120kg weight capacity. Designed for serious training — pull-ups, dips, muscle-ups, and bodyweight exercises. Professional-grade construction for homes, gyms, and academies. Made in India by Calineo.",
          handle: "calineo-titan-tower",
          weight: 30000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
            },
          ],
          options: [
            {
              title: "Variant",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "CALINEO-TITAN",
              options: {
                Variant: "Standard",
              },
              prices: [
                {
                  amount: 35000,
                  currency_code: "inr",
                },
                {
                  amount: 399,
                  currency_code: "eur",
                },
                {
                  amount: 429,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Calineo Balancing Beam",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Balance Equipment")!.id,
          ],
          description:
            "Montessori-inspired wooden balancing beam for coordination, early childhood fitness, and motor skills training. Safe rounded edges and non-slip surface. Perfect for homes, schools, and therapy centres. Made in India by Calineo.",
          handle: "calineo-balancing-beam",
          weight: 2000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
            },
          ],
          options: [
            {
              title: "Variant",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "CALINEO-BEAM",
              options: {
                Variant: "Standard",
              },
              prices: [
                {
                  amount: 3500,
                  currency_code: "inr",
                },
                {
                  amount: 39,
                  currency_code: "eur",
                },
                {
                  amount: 42,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Calineo Calisthenics Rings",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Training Equipment")!.id,
          ],
          description:
            "Premium gymnastic rings for upper body strength training. Easy home installation with adjustable straps. Suitable for kids and adults. Build grip strength, core stability, and shoulder mobility. Made in India by Calineo.",
          handle: "calineo-gymnastic-rings",
          weight: 1500,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
            },
          ],
          options: [
            {
              title: "Variant",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "CALINEO-RINGS",
              options: {
                Variant: "Standard",
              },
              prices: [
                {
                  amount: 2800,
                  currency_code: "inr",
                },
                {
                  amount: 32,
                  currency_code: "eur",
                },
                {
                  amount: 35,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        // --- Nalamoves (Switzerland) ---
        {
          title: "Nalamoves Nala Bars Combo — Premium Wall Bars",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Wall Bars & Ladders")!
              .id,
          ],
          description:
            "Premium Finnish birch wall bars combo from Switzerland. Full-body home workout system for pull-ups, stretching, mobility, and bodyweight training. Beautiful minimalist design that fits any living space. Includes Nalamoves app with guided workouts. 306+ 5-star reviews. Ships worldwide from Europe.",
          handle: "nalamoves-nala-bars-combo",
          weight: 30000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
            },
          ],
          options: [
            {
              title: "Wood",
              values: ["Natural", "Dark Walnut"],
            },
          ],
          variants: [
            {
              title: "Natural",
              sku: "NALA-COMBO-NAT",
              options: {
                Wood: "Natural",
              },
              prices: [
                {
                  amount: 52000,
                  currency_code: "inr",
                },
                {
                  amount: 519,
                  currency_code: "eur",
                },
                {
                  amount: 564,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Dark Walnut",
              sku: "NALA-COMBO-WALNUT",
              options: {
                Wood: "Dark Walnut",
              },
              prices: [
                {
                  amount: 55000,
                  currency_code: "inr",
                },
                {
                  amount: 549,
                  currency_code: "eur",
                },
                {
                  amount: 595,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        // --- Ungoverned (Australia) ---
        {
          title: "Ungoverned Vendetta UV-4.2 — All-Terrain Electric Board",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Electric Boards")!.id,
          ],
          description:
            "The world's only dual-track electric board engineered for terrain that defeats wheels. Dual independent front & rear track drive with independent traction control. Swappable Samsung lithium-ion battery with ~21km range. Top speed 42km/h. IP67-rated motors and remote with LCD display. Built in limited production runs in Australia by Ungoverned. For off-road use only.",
          handle: "ungoverned-vendetta",
          weight: 25000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
            },
          ],
          options: [
            {
              title: "Variant",
              values: ["Tactical"],
            },
          ],
          variants: [
            {
              title: "Tactical",
              sku: "UNGOV-VENDETTA",
              options: {
                Variant: "Tactical",
              },
              prices: [
                {
                  amount: 299999,
                  currency_code: "inr",
                },
                {
                  amount: 3449,
                  currency_code: "eur",
                },
                {
                  amount: 3699,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
