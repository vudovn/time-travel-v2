"use client";

import Image from "next/image";
import Wrapper from "@/components/wrapper";
import { Button } from "@/components/ui/button";

import GitHubActivityCalendar, {
  Props,
} from "@/components/github-calendar/activity-calendar";
import { Link } from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export default function Home() {
  const selectLastHalfYear: Props["transformData"] = (contributions) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const shownMonths = 6;

    return contributions.filter((activity) => {
      const date = new Date(activity.date);
      const monthOfDay = date.getMonth();

      return (
        monthOfDay > currentMonth - shownMonths && monthOfDay <= currentMonth
      );
    });
  };
  return (
    <section className="flex h-screen lg:flex-row">
      <section className="flex h-screen w-full  flex-col justify-between p-9 lg:h-auto">
        <Wrapper>
          <div className="flex flex-col justify-center items-center h-screen mx-auto">
            <GitHubActivityCalendar
              username={"ncnthien"}
              transformData={selectLastHalfYear}
              hideColorLegend
              fontSize={16}
              labels={{
                totalCount: "{{count}} contributions in the last half year",
              }}
              throwOnError
            />
            <div className=" mt-4 items-center">
              <a
                target="_blank"
                href="https://github.com/vudovn"
                className="flex items-center"
              >
                <p className="mr-2 text-white font-bold">
                  Follow me on Github for more updates!
                </p>
                <GitHubLogoIcon />
              </a>
            </div>
          </div>
        </Wrapper>
      </section>

      {/* second half */}
    </section>
  );
}
