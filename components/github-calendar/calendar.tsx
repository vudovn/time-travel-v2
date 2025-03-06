import { Activity, EventHandlerMap, Labels, ThemeInput } from "@/types";
import type { Day as WeekDay } from "date-fns";
import { CSSProperties, ReactElement, useEffect, useState } from "react";
import { BlockElement } from "react-activity-calendar";
import { groupByWeeks } from "./utils";
import { Button } from "../ui/button";
import { Check, Code, Copy, Pen, Trash, Trash2 } from "lucide-react";
import { DrawingPinIcon } from "@radix-ui/react-icons";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { generateCommit } from "@/utils";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { useToast } from "../ui/use-toast";

export interface ActivityCalendarProps {
  data: Array<Activity>;
  blockMargin?: number;
  blockRadius?: number;
  blockSize?: number;
  colorScheme?: "light" | "dark";
  eventHandlers?: EventHandlerMap;
  fontSize?: number;
  hideColorLegend?: boolean;
  hideMonthLabels?: boolean;
  hideTotalCount?: boolean;
  labels?: Labels;
  maxLevel?: number;
  loading?: boolean;
  renderBlock?: (block: BlockElement, activity: Activity) => ReactElement;
  showWeekdayLabels?: boolean;

  style?: CSSProperties;
  theme?: ThemeInput;
  totalCount?: number;

  weekStart?: WeekDay;
}

export interface Commit {
  date: string;
  count: number;
}

const MAPPED_COLORS = {
  1: "bg-green-200",
  2: "bg-green-300",
  3: "bg-green-400",
  4: "bg-green-500",
  5: "bg-green-600",
} as any;

export default function Calendar({
  data,
  fontSize = 14,
  hideMonthLabels = false,
  labels: labelsProp = undefined,
  style: styleProp = {},
  theme: themeProp = undefined,
  totalCount: totalCountProp = undefined,
  weekStart = 0, // Sunday
}: ActivityCalendarProps) {
  const weeks = groupByWeeks(data, weekStart);
  const [selectedType, setSelectedType] = useState<"add" | "remove">("add");
  const [selectedDate, setSelectedDate] = useState<Commit[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [content, setContent] = useState<string>("");
  const { toast } = useToast();
  const handleSelect = (date: string) => {
    console.log(date);
    if (selectedType === "remove") {
      setSelectedDate((prev) => prev.filter((d) => d.date !== date));
      return;
    }
    if (selectedDate.find((d) => d.date === date)) {
      setSelectedDate((prev) =>
        prev.map((d) => {
          if (d.date === date) {
            return {
              date,
              count: d.count < 5 ? d.count + 1 : 5,
            };
          }
          return d;
        })
      );
    } else
      setSelectedDate((prev) => [
        ...prev,
        {
          date,
          count: 1,
        },
      ]);
  };
  useEffect(() => {
    const logGenerateCommit = generateCommit(selectedDate);
    console.log({ logGenerateCommit });
    setContent(logGenerateCommit);
  }, [selectedDate]);
  function renderCalendar() {
    return weeks
      .map((week, weekIndex) =>
        week.map((activity, dayIndex) => {
          if (!activity) {
            return null;
          }
          const foundDate = selectedDate.find((d) => d.date === activity.date);
          return (
            <div
              onClick={() => handleSelect(activity.date)}
              className={`w-4 h-4 ${foundDate ? MAPPED_COLORS[foundDate.count] : "bg-zinc-600"} rounded-sm m-[1px]`}
              key={activity.date}
            ></div>
          );
        })
      )
      .map((week, x) => {
        return (
          <div className="m-[2px] flex flex-col" key={x}>
            {week}
          </div>
        );
      });
  }
  return (
    <div className="flex flex-col">
      <div className="my-4 w-full flex justify-between">
        <div>
          <Button
            variant={selectedType === "remove" ? "default" : "secondary"}
            onClick={() => setSelectedType("remove")}
            size="sm"
          >
            <Trash2 />
          </Button>
          <Button
            variant={selectedType === "add" ? "default" : "secondary"}
            onClick={() => setSelectedType("add")}
            size="sm"
            className="mx-4"
          >
            <Pen />
          </Button>
        </div>
        <div className="flex items-center">
          <Button className="mx-2" onClick={() => setSelectedDate([])}>
            Clear All
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Code />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[70%]">
              <div className="w-full h-[34rem] flex flex-col justify-center items-center p-4">
                <Button
                  onClick={() => {
                    toast({
                      title: "Copy script successful",
                    });
                    setIsCopied(true);
                    navigator.clipboard.writeText(content);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  size="sm"
                  className="self-end mb-8"
                >
                  {isCopied ? <Check /> : <Copy />}
                </Button>
                <code
                  style={{ whiteSpace: "break-spaces" }}
                  className="h-[80%] overflow-y-auto bg-zinc-800"
                >
                  {content}
                </code>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <div className="flex flex-col mr-4">
          <span className="text-[12px] font-bold">Mon</span>
          <span className="text-[12px] font-bold">Tue</span>
          <span className="text-[12px] font-bold">Wed</span>
          <span className="text-[12px] font-bold">Thu</span>
          <span className="text-[12px] font-bold">Fri</span>
          <span className="text-[12px] font-bold">Sat</span>
          <span className="text-[12px] font-bold">Sun</span>
        </div>
        <div className="flex max-w-2xl w-auto  overflow-x-auto h-full">
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
}
