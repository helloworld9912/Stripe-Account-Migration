import Stripe from "stripe";
import * as dotenv from "dotenv";
dotenv.config();

interface ISchedulesListRequestParams {
  limit: number;
  starting_after?: string;
}

// Stripe configuration and initialisation
const PAGE_SIZE = 100;
const SOURCE_STRIPE_SECRET_KEY: string = process.env
  .SOURCE_STRIPE_SECRET_KEY as string;
const DESTINATION_STRIPE_SECRET_KEY: string = process.env
  .DESTINATION_STRIPE_SECRET_KEY as string;

const sourceStripe = new Stripe(SOURCE_STRIPE_SECRET_KEY);
const destinationStripe = new Stripe(DESTINATION_STRIPE_SECRET_KEY);

// Function to retrieve all Scriptions Schedules from the source Stripe account
export async function getAllScriptionSchedules(): Promise<
  Stripe.SubscriptionSchedule[]
> {
  let schedules: Stripe.SubscriptionSchedule[] = [];
  let hasMore: boolean = true;
  let startingAfter: string | null = null;

  while (hasMore) {
    let request_params: ISchedulesListRequestParams = {
      limit: PAGE_SIZE,
    };

    if (startingAfter) {
      request_params["starting_after"] = startingAfter;
    }

    const response = await sourceStripe.subscriptionSchedules.list(
      request_params
    );

    schedules = schedules.concat(response.data);

    hasMore = response.has_more;
    if (response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    }
  }

  return schedules.reverse();
}

// Function to create a new Subscription Schedule in the destination Stripe account
async function createSubscriptionSchedule(
  schedule: Stripe.SubscriptionSchedule
): Promise<Stripe.SubscriptionSchedule> {
  const params: Stripe.SubscriptionScheduleCreateParams = {
    customer: schedule.customer as string,
    start_date: schedule.phases[0].start_date,
    end_behavior: schedule.end_behavior,
    phases: schedule.phases.map((phase) => ({
      items: phase.items.map((item) => ({
        price: item.price as string,
        quantity: item.quantity,
        tax_rates: item.tax_rates as string[] | undefined,
      })),
      //iterations: phase.iterations,
      start_date: phase.start_date,
      end_date: phase.end_date,
    })),
  };

  const newSchedule = await destinationStripe.subscriptionSchedules.create(
    params
  );

  return newSchedule;
}

// Function to migrate Scription Schedules
async function migrateScriptionSchedules(): Promise<void> {
  //check if destination and source env are properly set
  if (!SOURCE_STRIPE_SECRET_KEY || !DESTINATION_STRIPE_SECRET_KEY) {
    console.error(
      "Please set the SOURCE_STRIPE_SECRET_KEY and DESTINATION_STRIPE_SECRET_KEY environment variables."
    );
    return;
  }

  console.log("Starting the migration of Scription Schedules...");
  const subscription_schedules = await getAllScriptionSchedules();
  console.log(
    `Total subscription schedules to migrate: ${subscription_schedules.length}`
  );

  


  for (let schedule of subscription_schedules) {
    try {
      //show customers ids of the subscription schedules
      console.log(`Schedule id: ${schedule.customer}`);
      const newSchedule = await createSubscriptionSchedule(schedule);
      console.log(`New Schedule created: ${newSchedule.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `Failed to create subscription schedule: ${schedule.id} - reason: ${message}`
      );
    }
  }
}

export { migrateScriptionSchedules };
