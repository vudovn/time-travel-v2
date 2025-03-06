import { Commit } from "@/components/github-calendar/calendar";

export const generateCommit = (commits: Commit[]) => {
  return commits
    .map((commit) => {
      let result = "";
      for (let i = 0; i <= commit.count; i++) {
        const message = `commit ${i} of ${commit.date} with count ${commit.count}`;
        result += `
        echo "- Added fake commit ${message} with ${commit.count} commits" >> README.md
        git add .
        git commit --date ${commit.date} -m "${message}"
        `;
      }
      return result;
    })
    .join("");
};
