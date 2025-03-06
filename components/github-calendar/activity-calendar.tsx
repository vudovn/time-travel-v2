"use client";

import { generateTestData } from "@/components/github-calendar/utils";
import {
  Activity,
  ApiErrorResponse,
  ApiResponse,
  ThemeInput,
  Year,
} from "@/types";
import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format } from "date-fns";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { Skeleton } from "react-activity-calendar";
import Calendar, { ActivityCalendarProps } from "./calendar";
import { groupByWeeks } from "./utils";

import { Button } from "@/components/ui/button";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export interface Props extends Omit<ActivityCalendarProps, "data" | "theme"> {
  username: string;
  errorMessage?: string;
  theme?: ThemeInput;
  throwOnError?: boolean;
  transformData?: (data: Array<Activity>) => Array<Activity>;
  transformTotalCount?: boolean;
  year?: Year;
}

async function fetchCalendarData(username: string): Promise<ApiResponse> {
  const response = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${username}`
  );
  const data: ApiResponse | ApiErrorResponse = await response.json();

  if (!response.ok) {
    throw Error(
      `Fetching GitHub contribution data for "${username}" failed: ${(data as ApiErrorResponse).error}`
    );
  }
  return data as ApiResponse;
}
const GitHubActivityCalendar: FunctionComponent<Props> = ({
  username,
  labels,
  transformData: transformFn,
  transformTotalCount = true,
  throwOnError = false,
  errorMessage = `Error: Fetching GitHub contribution data for "${username}" failed.`,
  ...props
}) => {
  const [data, setData] = useState<ApiResponse | null>(null);
  // const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2023, 6, 1),
    to: addDays(new Date(2024, 1, 1), 20),
  });
  // const [error, setError] = useState<Error | null>(null);

  // console.log({ date });

  // const fetchData = useCallback(() => {
  //   setLoading(true);
  //   setError(null);
  //   fetchCalendarData(username)
  //     .then(setData)
  //     .catch(setError)
  //     .finally(() => setLoading(false));
  // }, [username]);

  // useEffect(fetchData, [fetchData]);

  // // React error boundaries can't handle asynchronous code, so rethrow.
  // if (error) {
  //   if (throwOnError) {
  //     throw error;
  //   } else {
  //     return <div>{errorMessage}</div>;
  //   }
  // }

  // if (loading || !data) {
  //   return <Skeleton {...props} loading />;
  // }

  const theme = props.theme;

  const defaultLabels = {
    totalCount: `{{count}} contributions in the last year`,
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className={cn("grid gap-2")}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <UICalendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Calendar
        data={generateTestData({
          maxLevel: 10,
          interval: {
            start: date?.from || new Date("2023-06-01"),
            end: date?.to || new Date("2024-01-01"),
          },
        })}
        theme={theme}
        labels={Object.assign({}, defaultLabels, labels)}
        totalCount={transformFn && transformTotalCount ? undefined : 10}
        {...props}
        maxLevel={4}
      />
    </div>
  );
};

export default GitHubActivityCalendar;
