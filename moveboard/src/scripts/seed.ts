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
    fields: ["id"],
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
