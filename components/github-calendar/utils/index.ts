import { Props } from "@/components/github-calendar/activity-calendar";
import { DEFAULT_MONTH_LABELS } from "@/constants";
import { Activity, Week } from "@/types";
import type { Day as WeekDay } from "date-fns";
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfYear,
  formatISO,
  getDay,
  getMonth,
  nextDay,
  parseISO,
  startOfYear,
  subWeeks,
} from "date-fns";

interface MonthLabel {
  weekIndex: number;
  label: string;
}

export const transformData = (
  data: Array<Activity>,
  transformFn?: Props["transformData"]
): Array<Activity> => {
  if (typeof transformFn !== "function") {
    return data;
  }

  const transformedData = transformFn(data);

  if (!Array.isArray(transformedData)) {
    throw Error(
      `Passed function transformData must return a list of Day objects.`
    );
  }

  if (transformedData.length > 0) {
    const testObj = transformedData[0];

    if (typeof testObj.count !== "number" || testObj.count < 0) {
      throw Error(
        `Required property "count: number" missing or invalid. Got: ${testObj.count}`
      );
    }

    if (!/\d{4}-\d{2}-\d{2}/.test(testObj.date)) {
      throw Error(
        `Required property "date: YYYY-MM-DD" missing or invalid. Got: ${testObj.date}`
      );
    }

    if (
      typeof testObj.level !== "number" ||
      testObj.level < 0 ||
      testObj.level > 4
    ) {
      throw Error(
        `Required property "level: 0 | 1 | 2 | 3 | 4" missing or invalid: Got: ${testObj.level}.`
      );
    }
  }

  return transformedData;
};

export function groupByWeeks(
  activities: Array<Activity>,
  weekStart: WeekDay = 0 // 0 = Sunday
): Array<Week> {
  if (activities.length === 0) {
    return [];
  }

  const normalizedActivities = fillHoles(activities);

  const firstDate = parseISO(normalizedActivities[0].date);
  const firstCalendarDate =
    getDay(firstDate) === weekStart
      ? firstDate
      : subWeeks(nextDay(firstDate, weekStart), 1);

  const paddedActivities = [
    ...Array(differenceInCalendarDays(firstDate, firstCalendarDate)).fill(
      undefined
    ),
    ...normalizedActivities,
  ];

  const numberOfWeeks = Math.ceil(paddedActivities.length / 7);

  // Finally, group activities by week
  return Array(numberOfWeeks)
    .fill(undefined)
    .map((_, weekIndex) =>
      paddedActivities.slice(weekIndex * 7, weekIndex * 7 + 7)
    );
}

function fillHoles(activities: Array<Activity>): Array<Activity> {
  const dateMap: Record<string, Activity> = {};
  for (const activity of activities) {
    dateMap[activity.date] = activity;
  }

  return eachDayOfInterval({
    start: parseISO(activities[0].date),
    end: parseISO(activities[activities.length - 1].date),
  }).map((day) => {
    const date = formatISO(day, { representation: "date" });

    if (dateMap[date]) {
      return dateMap[date];
    }

    return {
      date,
      count: 0,
      level: 0,
    };
  });
}
export function generateTestData(args: {
  interval?: { start: Date; end: Date };
  maxLevel?: number;
}): Array<Activity> {
  const maxCount = 20;
  const maxLevel = args.maxLevel ? Math.max(1, args.maxLevel) : 4;
  const now = new Date();

  const days = eachDayOfInterval(
    args.interval ?? {
      start: startOfYear(now),
      end: endOfYear(now),
    }
  );

  return days.map((date) => {
    // The random activity count is shifted by up to 80% towards zero.
    const c = Math.round(
      Math.random() * maxCount - Math.random() * (0.8 * maxCount)
    );
    const count = Math.max(0, c);
    const level = Math.ceil((count / maxCount) * maxLevel);

    return {
      date: formatISO(date, { representation: "date" }),
      count,
      level,
    };
  });
}

export function getMonthLabels(
  weeks: Array<Week>,
  monthNames: Array<string> = DEFAULT_MONTH_LABELS
): Array<MonthLabel> {
  return weeks
    .reduce<Array<MonthLabel>>((labels, week, weekIndex) => {
      const firstActivity = week.find((activity) => activity !== undefined);

      if (!firstActivity) {
        throw new Error(
          `Unexpected error: Week ${weekIndex + 1} is empty: [${week}].`
        );
      }

      const month = monthNames[getMonth(parseISO(firstActivity.date))];
      const prevLabel = labels[labels.length - 1];

      if (weekIndex === 0 || prevLabel.label !== month) {
        return [...labels, { weekIndex, label: month }];
      }

      return labels;
    }, [])
    .filter(({ weekIndex }, index, labels) => {
      // Labels should only be shown if there is "enough" space (data).
      // This is a naive implementation that does not take the block size,
      // font size etc. into account.
      const minWeeks = 3;

      // Skip the first month label if there is not enough space to the next one.
      if (index === 0) {
        return labels[1] && labels[1].weekIndex - weekIndex >= minWeeks;
      }

      // Skip the last month label the there is not enough data in that month to
      // avoid overflowing the calendar on the right.
      if (index === labels.length - 1) {
        return weeks.slice(weekIndex).length >= minWeeks;
      }

      return true;
    });
}
