import csv
from jobspy import scrape_jobs

jobs = scrape_jobs(
    site_name=["linkedin"],
    search_term="software engineer",
    location="Bangalore, India",
    results_wanted=5,
    country_indeed='India',
)

print(f"Found {len(jobs)} jobs")
jobs.to_csv("jobs.csv", quoting=csv.QUOTE_NONNUMERIC, escapechar="\\", index=False)
print("Saved to jobs.csv")
