// AI Job Matcher Frontend
class JobMatcherApp {
  constructor() {
    this.socket = null;
    this.results = null;
    this.currentTab = "skills";

    this.init();
  }

  init() {
    // Connect to WebSocket
    this.connectSocket();

    // Bind events
    this.bindEvents();
  }

  connectSocket() {
    this.socket = io();

    this.socket.on("connect", () => {
      console.log("Connected to server");
    });

    this.socket.on("progress", (data) => {
      this.handleProgress(data);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }

  bindEvents() {
    // Form submit
    document.getElementById("searchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.startAnalysis();
    });

    // New search button
    document.getElementById("newSearchBtn").addEventListener("click", () => {
      this.resetUI();
    });

    // Tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // File upload
    this.setupFileUpload();
  }

  setupFileUpload() {
    const fileUpload = document.getElementById("fileUpload");
    const fileInput = document.getElementById("resumeFile");

    fileUpload.addEventListener("click", () => fileInput.click());

    fileUpload.addEventListener("dragover", (e) => {
      e.preventDefault();
      fileUpload.classList.add("dragover");
    });

    fileUpload.addEventListener("dragleave", () => {
      fileUpload.classList.remove("dragover");
    });

    fileUpload.addEventListener("drop", (e) => {
      e.preventDefault();
      fileUpload.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        this.handleFileSelect(file);
      }
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleFileSelect(file);
      }
    });
  }

  async handleFileSelect(file) {
    const fileUpload = document.getElementById("fileUpload");
    const fileText = document.getElementById("fileText");

    fileText.textContent = `📎 ${file.name}`;
    fileUpload.classList.add("has-file");

    // Upload file
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.path) {
        document.getElementById("resumePath").value = data.path;
        fileText.textContent = `✓ ${file.name} uploaded`;
      }
    } catch (error) {
      console.error("Upload failed:", error);
      fileText.textContent = `Using: ${file.name}`;
    }
  }

  async startAnalysis() {
    const resumePath = document.getElementById("resumePath").value;
    const currentLocation = document.getElementById("currentLocation").value;
    const desiredLocation = document.getElementById("desiredLocation").value;
    const isRemote = document.getElementById("isRemote").checked;

    // Update UI
    this.showProgress();
    this.setButtonLoading(true);

    try {
      const response = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_path: resumePath,
          current_location: currentLocation,
          desired_location: desiredLocation,
          is_remote: isRemote,
        }),
      });

      const data = await response.json();

      if (data.error) {
        this.showError(data.error);
        this.setButtonLoading(false);
      }
    } catch (error) {
      this.showError("Failed to start analysis: " + error.message);
      this.setButtonLoading(false);
    }
  }

  handleProgress(data) {
    const { step, progress, message, data: resultData } = data;

    // Update progress bar
    document.getElementById("progressFill").style.width = `${progress}%`;
    document.getElementById("progressText").textContent = message;

    // Update steps
    this.updateSteps(step, progress);

    // Handle completion
    if (step === "complete" && resultData) {
      this.results = resultData;
      setTimeout(() => {
        this.showResults();
      }, 500);
    }

    // Handle error
    if (step === "error") {
      this.showError(message);
    }
  }

  updateSteps(currentStep, progress) {
    const stepMap = {
      init: { el: "init", threshold: 5 },
      resume: { el: "resume", threshold: 15 },
      resume_parsed: { el: "resume", threshold: 25 },
      profile_enhanced: { el: "resume", threshold: 35 },
      queries_generated: { el: "queries", threshold: 45 },
      jobs_searched: { el: "search", threshold: 60 },
      jobs_scored: { el: "score", threshold: 85 },
      guidance_generated: { el: "guidance", threshold: 95 },
      complete: { el: "guidance", threshold: 100 },
    };

    const steps = document.querySelectorAll(".step");
    const stepOrder = [
      "init",
      "resume",
      "queries",
      "search",
      "score",
      "guidance",
    ];

    let currentIndex = -1;
    if (stepMap[currentStep]) {
      currentIndex = stepOrder.indexOf(stepMap[currentStep].el);
    }

    steps.forEach((step, index) => {
      const stepName = step.dataset.step;
      const stepIdx = stepOrder.indexOf(stepName);

      step.classList.remove("active", "complete");

      if (
        stepIdx < currentIndex ||
        (stepIdx === currentIndex && progress >= 100)
      ) {
        step.classList.add("complete");
        step.querySelector(".step-status").textContent = "Complete ✓";
      } else if (stepIdx === currentIndex) {
        step.classList.add("active");
        step.querySelector(".step-status").textContent = "In progress...";
      } else {
        step.querySelector(".step-status").textContent = "Waiting...";
      }
    });
  }

  showProgress() {
    document.getElementById("inputSection").style.display = "none";
    document.getElementById("progressSection").style.display = "block";
    document.getElementById("resultsSection").style.display = "none";
  }

  showResults() {
    document.getElementById("progressSection").style.display = "none";
    document.getElementById("resultsSection").style.display = "block";
    document.getElementById("resultsSection").classList.add("fade-in");

    this.renderProfile();
    this.renderStats();
    this.renderMatches();
    this.renderGuidance();

    this.setButtonLoading(false);
  }

  renderProfile() {
    const profile = this.results.profile;
    if (!profile) return;

    const contact = profile.contact || {};
    const skills = profile.skills || {};
    const technicalSkills = skills.technical || [];

    let html = `
            <div class="profile-item">
                <div class="profile-item-label">Name</div>
                <div class="profile-item-value">${
                  contact.name || "Unknown"
                }</div>
            </div>
            <div class="profile-item">
                <div class="profile-item-label">Email</div>
                <div class="profile-item-value">${
                  contact.email || "Not provided"
                }</div>
            </div>
            <div class="profile-item">
                <div class="profile-item-label">Experience</div>
                <div class="profile-item-value">${
                  profile.years_of_experience || 0
                } years</div>
            </div>
            <div class="profile-item">
                <div class="profile-item-label">Target Roles</div>
                <div class="profile-item-value">${
                  (profile.target_roles || []).slice(0, 3).join(", ") ||
                  "Not specified"
                }</div>
            </div>
        `;

    if (technicalSkills.length > 0) {
      html += `
                <div class="profile-item" style="grid-column: 1 / -1;">
                    <div class="profile-item-label">Technical Skills</div>
                    <div class="skills-list">
                        ${technicalSkills
                          .slice(0, 12)
                          .map((s) => `<span class="skill-tag">${s}</span>`)
                          .join("")}
                    </div>
                </div>
            `;
    }

    document.getElementById("profileContent").innerHTML = html;
  }

  renderStats() {
    const matches = this.results.all_matches || [];
    const guidance = this.results.career_guidance || {};

    const totalJobs = matches.length;
    const avgScore =
      matches.length > 0
        ? Math.round(
            (matches.reduce((sum, m) => sum + (m.overall_score || 0), 0) /
              matches.length) *
              100
          )
        : 0;
    const topScore =
      matches.length > 0
        ? Math.round((matches[0].overall_score || 0) * 100)
        : 0;
    const skillGaps = (guidance.skill_gaps || []).length;

    document.getElementById("totalJobs").textContent = totalJobs;
    document.getElementById("avgScore").textContent = avgScore + "%";
    document.getElementById("topScore").textContent = topScore + "%";
    document.getElementById("skillGaps").textContent = skillGaps;
  }

  renderMatches() {
    const matches = this.results.top_matches || [];

    if (matches.length === 0) {
      document.getElementById("matchesList").innerHTML =
        '<p style="text-align:center;color:var(--text-muted);">No matches found</p>';
      return;
    }

    const html = matches
      .map((match, index) => {
        const score = Math.round((match.overall_score || 0) * 100);
        const matchingSkills = (match.matching_skills || []).slice(0, 3);
        const missingSkills = (match.missing_skills || []).slice(0, 3);

        let salaryText = "";
        if (match.salary_min && match.salary_max) {
          salaryText = `$${Math.round(
            match.salary_min / 1000
          )}k - $${Math.round(match.salary_max / 1000)}k`;
        } else if (match.salary_min) {
          salaryText = `From $${Math.round(match.salary_min / 1000)}k`;
        }

        return `
                <div class="match-item fade-in" style="animation-delay: ${
                  index * 0.1
                }s">
                    <div class="match-rank">${index + 1}</div>
                    <div class="match-info">
                        <div class="match-title">${
                          match.title || "Unknown Position"
                        }</div>
                        <div class="match-company">🏢 ${
                          match.company || "Unknown Company"
                        }</div>
                        <div class="match-meta">
                            <span class="match-location">📍 ${
                              match.location || "Not specified"
                            }</span>
                            ${
                              salaryText
                                ? `<span class="match-salary">💰 ${salaryText}</span>`
                                : ""
                            }
                        </div>
                        <div class="match-skills">
                            ${matchingSkills
                              .map(
                                (s) =>
                                  `<span class="match-skill has">✓ ${s}</span>`
                              )
                              .join("")}
                            ${missingSkills
                              .map(
                                (s) =>
                                  `<span class="match-skill missing">✗ ${s}</span>`
                              )
                              .join("")}
                        </div>
                    </div>
                    <div class="match-score">
                        <div class="score-circle" style="--score: ${score}">
                            <span class="score-value">${score}%</span>
                        </div>
                        ${
                          match.job_url
                            ? `<a href="${match.job_url}" target="_blank" class="match-link">View Job →</a>`
                            : ""
                        }
                    </div>
                </div>
            `;
      })
      .join("");

    document.getElementById("matchesList").innerHTML = html;
  }

  renderGuidance() {
    this.switchTab(this.currentTab);
  }

  switchTab(tab) {
    this.currentTab = tab;
    const guidance = this.results?.career_guidance || {};

    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });

    let html = "";

    switch (tab) {
      case "skills":
        const skillGaps = guidance.skill_gaps || [];
        if (skillGaps.length === 0) {
          html =
            '<p style="text-align:center;color:var(--text-muted);">No skill gaps identified</p>';
        } else {
          html = `
                        <ul class="guidance-list">
                            ${skillGaps
                              .map((skill) => `<li>🔧 ${skill}</li>`)
                              .join("")}
                        </ul>
                    `;
        }

        // Add salary insights if available
        if (guidance.salary_insights) {
          html += `<div class="salary-insight" style="margin-top:1.5rem;">💰 ${guidance.salary_insights}</div>`;
        }
        break;

      case "learning":
        const learning = guidance.learning_recommendations || [];
        if (learning.length === 0) {
          html =
            '<p style="text-align:center;color:var(--text-muted);">No learning recommendations available</p>';
        } else {
          html = `
                        <ul class="guidance-list">
                            ${learning
                              .map(
                                (item) => `
                                <li class="learning-item">
                                    <div>
                                        <div class="learning-skill">${
                                          item.skill || "Skill"
                                        }</div>
                                        <div class="learning-resource">${
                                          item.resource || "Resource"
                                        }</div>
                                        <div class="learning-platform">📚 ${
                                          item.platform || "Platform"
                                        }</div>
                                    </div>
                                    <div class="learning-time">⏱️ ${
                                      item.estimated_time || "N/A"
                                    }</div>
                                </li>
                            `
                              )
                              .join("")}
                        </ul>
                    `;
        }
        break;

      case "resume":
        const resumeTips = guidance.resume_improvements || [];
        const careerPaths = guidance.career_paths || [];

        if (resumeTips.length === 0 && careerPaths.length === 0) {
          html =
            '<p style="text-align:center;color:var(--text-muted);">No resume tips available</p>';
        } else {
          html = "";
          if (resumeTips.length > 0) {
            html += `
                            <h3 style="margin-bottom:1rem;color:var(--text-secondary);">📝 Resume Improvements</h3>
                            <ul class="guidance-list">
                                ${resumeTips
                                  .map((tip) => `<li>${tip}</li>`)
                                  .join("")}
                            </ul>
                        `;
          }
          if (careerPaths.length > 0) {
            html += `
                            <h3 style="margin:1.5rem 0 1rem;color:var(--text-secondary);">🛤️ Career Paths</h3>
                            <ul class="guidance-list">
                                ${careerPaths
                                  .map((path) => `<li>→ ${path}</li>`)
                                  .join("")}
                            </ul>
                        `;
          }
        }
        break;

      case "interview":
        const interviewTips = guidance.interview_tips || [];
        if (interviewTips.length === 0) {
          html =
            '<p style="text-align:center;color:var(--text-muted);">No interview tips available</p>';
        } else {
          html = `
                        <ul class="guidance-list">
                            ${interviewTips
                              .map((tip) => `<li>💬 ${tip}</li>`)
                              .join("")}
                        </ul>
                    `;
        }
        break;
    }

    document.getElementById("guidanceContent").innerHTML = html;
  }

  resetUI() {
    document.getElementById("inputSection").style.display = "block";
    document.getElementById("progressSection").style.display = "none";
    document.getElementById("resultsSection").style.display = "none";

    // Reset progress
    document.getElementById("progressFill").style.width = "0%";
    document.getElementById("progressText").textContent = "Initializing...";

    // Reset steps
    document.querySelectorAll(".step").forEach((step) => {
      step.classList.remove("active", "complete");
      step.querySelector(".step-status").textContent = "Waiting...";
    });

    this.results = null;
  }

  setButtonLoading(loading) {
    const btn = document.getElementById("startBtn");
    const btnText = btn.querySelector(".btn-text");
    const btnLoading = btn.querySelector(".btn-loading");

    btn.disabled = loading;
    btnText.style.display = loading ? "none" : "inline";
    btnLoading.style.display = loading ? "inline-flex" : "none";
  }

  showError(message) {
    document.getElementById("progressText").textContent = "❌ " + message;
    document.getElementById("progressText").style.color = "var(--error)";
    this.setButtonLoading(false);
  }
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  window.app = new JobMatcherApp();
});
