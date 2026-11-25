(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var recipient = "anthonycombalicer66@gmail.com";
  var ghUser = "anthonycombalicer66-maker";

  var themeBtn = document.getElementById("theme");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var darkMedia = window.matchMedia("(prefers-color-scheme: dark)");

  function isDarkActive() {
    var explicit = root.getAttribute("data-theme");
    if (explicit === "dark") return true;
    if (explicit === "light") return false;
    return darkMedia.matches;
  }

  function syncThemeUI() {
    if (!themeBtn) return;
    var dark = isDarkActive();
    themeBtn.setAttribute("aria-checked", String(dark));
    themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    if (themeMeta) themeMeta.setAttribute("content", dark ? "#080d18" : "#f7f9fc");
  }

  function toggleTheme() {
    var next = isDarkActive() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    syncThemeUI();
  }

  syncThemeUI();

  if (window.requestAnimationFrame) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add("theme-ready");
        if (themeBtn) themeBtn.classList.add("is-ready");
      });
    });
  } else {
    root.classList.add("theme-ready");
    if (themeBtn) themeBtn.classList.add("is-ready");
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", toggleTheme);
  }

  if (darkMedia.addEventListener) {
    darkMedia.addEventListener("change", syncThemeUI);
  }

  var progressBar = document.getElementById("scroll-progress");
  function updateScrollProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY || root.scrollTop || 0;
    var docHeight = root.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
    progressBar.style.width = pct.toFixed(1) + "%";
  }
  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress, { passive: true });

  var timeEl = document.getElementById("local-time");
  function updateClock() {
    if (!timeEl) return;
    try {
      var formatted = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(new Date());
      timeEl.textContent = formatted;
    } catch (e) {
      timeEl.textContent = new Date().toLocaleTimeString();
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  var isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || "");
  if (!isMac) {
    document.querySelectorAll("[data-cmd-kbd]").forEach(function (el) {
      el.textContent = "Ctrl K";
    });
  }

  var menuBtn = document.getElementById("menu-toggle");
  var navLinks = document.getElementById("nav-links");

  function setMenuOpen(open) {
    if (!menuBtn || !navLinks) return;
    navLinks.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  }

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      setMenuOpen(!navLinks.classList.contains("is-open"));
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navLinks.classList.contains("is-open")) {
        setMenuOpen(false);
        menuBtn.focus();
      }
    });
  }

  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#";

  if (!reducedMotion) {
    document.querySelectorAll("[data-scramble]").forEach(function (el) {
      var original = el.getAttribute("data-scramble") || el.textContent;
      var timer = null;
      el.addEventListener("mouseenter", function () {
        var step = 0;
        if (timer) clearInterval(timer);
        timer = setInterval(function () {
          el.textContent = original
            .split("")
            .map(function (ch, idx) {
              if (ch === " " || ch === "/" || ch === "-" || ch === "&") return ch;
              if (idx < step) return original[idx];
              return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            })
            .join("");
          step += 1.2;
          if (step >= original.length) {
            clearInterval(timer);
            el.textContent = original;
          }
        }, 22);
      });
    });
  }

  var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  var caseCards = Array.prototype.slice.call(document.querySelectorAll(".case-card"));
  var toolsBlock = document.getElementById("tools-block");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      caseCards.forEach(function (card) {
        var cat = card.getAttribute("data-category");
        card.classList.toggle("is-hidden", target !== "all" && cat !== target);
      });
      if (toolsBlock) {
        toolsBlock.classList.toggle("is-hidden", target !== "all" && target !== "tools");
      }
      updateScrollProgress();
    });
  });

  function copyText(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        if (onDone) onDone(true);
      }).catch(function () {
        if (onDone) onDone(false);
      });
      return;
    }
    var temp = document.createElement("textarea");
    temp.value = text;
    temp.setAttribute("readonly", "");
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {}
    document.body.removeChild(temp);
    if (onDone) onDone(ok);
  }

  document.querySelectorAll(".copy-code-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var drawer = btn.closest(".code-drawer");
      var codeEl = drawer ? drawer.querySelector("pre code") : null;
      if (!codeEl) return;
      copyText(codeEl.textContent || "", function (ok) {
        if (!ok) return;
        btn.textContent = "Copied!";
        setTimeout(function () {
          btn.textContent = "Copy snippet";
        }, 1800);
      });
    });
  });

  var copyPhoneBtn = document.getElementById("copy-phone-btn");
  if (copyPhoneBtn) {
    copyPhoneBtn.addEventListener("click", function () {
      var phone = copyPhoneBtn.getAttribute("data-phone") || "09695362515";
      copyText(phone, function (ok) {
        if (!ok) return;
        copyPhoneBtn.textContent = "Copied!";
        setTimeout(function () {
          copyPhoneBtn.textContent = "Copy";
        }, 1800);
      });
    });
  }

  var simToggle = document.getElementById("bracket-sim-toggle");
  var simPanel = document.getElementById("bracket-sim-panel");
  var simBoard = document.getElementById("bsim-board");
  var simShuffle = document.getElementById("bsim-shuffle");
  var simReset = document.getElementById("bsim-reset");

  if (simToggle && simPanel && simBoard) {
    var basePlayers = ["Jin_Kazama", "Bryan_Fury", "King_PH", "Law_Albay"];
    var seeds = basePlayers.slice();
    var semi1Winner = null;
    var semi2Winner = null;
    var grandWinner = null;

    function renderBracket() {
      simBoard.innerHTML = "";

      var col1 = document.createElement("div");
      col1.className = "bsim-col";
      col1.innerHTML = "<span class='bsim-col-title'>Semifinals</span>";

      function makeMatch(p1, p2, currentWinner, onPick) {
        var box = document.createElement("div");
        box.className = "bsim-match";
        [p1, p2].forEach(function (player) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "bsim-slot" + (player && currentWinner === player ? " is-winner" : "");
          btn.textContent = player || "TBD";
          btn.disabled = !player;
          if (player) {
            btn.addEventListener("click", function () {
              onPick(player);
            });
          }
          box.appendChild(btn);
        });
        return box;
      }

      col1.appendChild(
        makeMatch(seeds[0], seeds[1], semi1Winner, function (p) {
          semi1Winner = p;
          if (grandWinner !== semi1Winner && grandWinner !== semi2Winner) grandWinner = null;
          renderBracket();
        })
      );
      col1.appendChild(
        makeMatch(seeds[2], seeds[3], semi2Winner, function (p) {
          semi2Winner = p;
          if (grandWinner !== semi1Winner && grandWinner !== semi2Winner) grandWinner = null;
          renderBracket();
        })
      );

      var col2 = document.createElement("div");
      col2.className = "bsim-col";
      col2.innerHTML = "<span class='bsim-col-title'>Grand Finals</span>";
      col2.appendChild(
        makeMatch(semi1Winner, semi2Winner, grandWinner, function (p) {
          grandWinner = p;
          renderBracket();
        })
      );

      var col3 = document.createElement("div");
      col3.className = "bsim-col";
      col3.innerHTML = "<span class='bsim-col-title'>Champion</span>";
      var champBox = document.createElement("div");
      champBox.className = "bsim-champ";
      var champLabel = document.createElement("span");
      champLabel.className = "bsim-champ-label";
      champLabel.textContent = "Tournament Winner";
      var champName = document.createElement("div");
      champName.className = "bsim-champ-name";
      champName.textContent = grandWinner || "Awaiting Final";
      champBox.appendChild(champLabel);
      champBox.appendChild(champName);
      col3.appendChild(champBox);

      simBoard.appendChild(col1);
      simBoard.appendChild(col2);
      simBoard.appendChild(col3);
    }

    simToggle.addEventListener("click", function () {
      var willOpen = simPanel.hasAttribute("hidden");
      if (willOpen) {
        simPanel.removeAttribute("hidden");
        simToggle.setAttribute("aria-expanded", "true");
        simToggle.textContent = "Hide bracket";
        renderBracket();
      } else {
        simPanel.setAttribute("hidden", "");
        simToggle.setAttribute("aria-expanded", "false");
        simToggle.textContent = "Try interactive bracket";
      }
      updateScrollProgress();
    });

    if (simShuffle) {
      simShuffle.addEventListener("click", function () {
        for (var i = seeds.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = seeds[i];
          seeds[i] = seeds[j];
          seeds[j] = tmp;
        }
        semi1Winner = null;
        semi2Winner = null;
        grandWinner = null;
        renderBracket();
      });
    }

    if (simReset) {
      simReset.addEventListener("click", function () {
        seeds = basePlayers.slice();
        semi1Winner = null;
        semi2Winner = null;
        grandWinner = null;
        renderBracket();
      });
    }
  }

  var dialog = document.getElementById("lb");
  var dialogImg = document.getElementById("lb-img");
  var dialogCaption = document.getElementById("lb-caption");
  var closeBtn = document.getElementById("lb-close");
  var lastTrigger = null;

  if (dialog && dialogImg) {
    document.querySelectorAll(".frame button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var img = btn.querySelector("img");
        if (!img) return;
        lastTrigger = btn;
        dialogImg.src = img.currentSrc || img.src;
        dialogImg.alt = img.alt;
        if (dialogCaption) dialogCaption.textContent = img.alt;
        dialog.showModal();
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        dialog.close();
      });
    }

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        dialog.close();
      }
    });

    dialog.addEventListener("close", function () {
      if (lastTrigger) {
        lastTrigger.focus();
        lastTrigger = null;
      }
    });
  }

  var emailModal = document.getElementById("email-modal");
  var emClose = document.getElementById("em-close");
  var emCopy = document.getElementById("em-copy");
  var emStatus = document.getElementById("em-status");
  var emSubject = document.getElementById("em-subject");
  var emBody = document.getElementById("em-body");
  var emGmail = document.getElementById("em-gmail");
  var emMailto = document.getElementById("em-mailto");
  var lastEmailTrigger = null;

  function syncEmailLinks() {
    var su = encodeURIComponent((emSubject && emSubject.value.trim()) || "Internship Inquiry");
    var bodyVal = emBody ? emBody.value.trim() : "";
    var bodyParam = bodyVal ? "&body=" + encodeURIComponent(bodyVal) : "";

    if (emGmail) {
      emGmail.href =
        "https://mail.google.com/mail/?view=cm&fs=1&to=" +
        encodeURIComponent(recipient) +
        "&su=" +
        su +
        bodyParam;
    }
    if (emMailto) {
      emMailto.href = "mailto:" + recipient + "?subject=" + su + bodyParam;
    }
  }

  function openEmailModal(triggerEl) {
    if (!emailModal) return;
    lastEmailTrigger = triggerEl || document.activeElement;
    if (emStatus) emStatus.textContent = "";
    syncEmailLinks();
    emailModal.showModal();
  }

  if (emailModal) {
    syncEmailLinks();
    if (emSubject) emSubject.addEventListener("input", syncEmailLinks);
    if (emBody) emBody.addEventListener("input", syncEmailLinks);

    document.querySelectorAll("[data-email-trigger]").forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
          return;
        }
        event.preventDefault();
        openEmailModal(trigger);
      });
    });

    if (emClose) {
      emClose.addEventListener("click", function () {
        emailModal.close();
      });
    }

    emailModal.addEventListener("click", function (event) {
      if (event.target === emailModal) {
        emailModal.close();
      }
    });

    emailModal.addEventListener("close", function () {
      if (lastEmailTrigger && lastEmailTrigger.focus) {
        lastEmailTrigger.focus();
        lastEmailTrigger = null;
      }
    });

    if (emCopy) {
      emCopy.addEventListener("click", function () {
        copyText(recipient, function (ok) {
          if (ok) {
            emCopy.textContent = "Copied!";
            if (emStatus) emStatus.textContent = "Copied " + recipient + " to clipboard.";
            setTimeout(function () {
              emCopy.textContent = "Copy email";
            }, 2000);
          } else if (emStatus) {
            emStatus.textContent = "Select and copy: " + recipient;
          }
        });
      });
    }
  }

  var cmdModal = document.getElementById("cmd-modal");
  var cmdInput = document.getElementById("cmd-input");
  var cmdList = document.getElementById("cmd-list");
  var cmdClose = document.getElementById("cmd-close");
  var cmdTrigger = document.getElementById("cmd-trigger");
  var cmdIndex = 0;
  var filteredCommands = [];

  var commands = [
    { label: "Jump to 01 · About & Education", group: "Section", run: function () { location.hash = "#about"; } },
    { label: "Jump to 02 · Build Activity", group: "Section", run: function () { location.hash = "#activity"; } },
    { label: "Jump to 03 · Technical Stack", group: "Section", run: function () { location.hash = "#skills"; } },
    { label: "Jump to 04 · Featured Projects", group: "Section", run: function () { location.hash = "#projects"; } },
    { label: "Jump to 05 · Contact", group: "Section", run: function () { location.hash = "#contact"; } },
    { label: "Launch CraftHub Live Demo", group: "Demo", run: function () { window.open("https://anthonycombalicer66-maker.github.io/CraftHub/", "_blank", "noopener"); } },
    { label: "Play Pixel-Descent RPG", group: "Demo", run: function () { window.open("https://anthonycombalicer66-maker.github.io/Pixel-Descent/", "_blank", "noopener"); } },
    { label: "Launch BiteRush Storefront", group: "Demo", run: function () { window.open("https://anthonycombalicer66-maker.github.io/BiteRush/", "_blank", "noopener"); } },
    {
      label: "Try Interactive Tekken 7 Bracket",
      group: "Sandbox",
      run: function () {
        var allFilter = document.querySelector('.filter-btn[data-filter="all"]');
        if (toolsBlock && toolsBlock.classList.contains("is-hidden") && allFilter) {
          allFilter.click();
        }
        location.hash = "#tools-block";
        if (simPanel && simPanel.hasAttribute("hidden") && simToggle) simToggle.click();
      }
    },
    { label: "View Online Résumé", group: "Résumé", run: function () { window.open("resume.html", "_blank", "noopener"); } },
    { label: "Download Résumé PDF", group: "Résumé", run: function () { var a = document.createElement("a"); a.href = "assets/Anthony_Combalicer_Resume.pdf"; a.download = "Anthony_Combalicer_Resume.pdf"; a.click(); } },
    { label: "Email Anthony Combalicer", group: "Action", run: function () { openEmailModal(cmdTrigger); } },
    { label: "Copy Email Address", group: "Action", run: function () { copyText(recipient, function () { openEmailModal(cmdTrigger); if (emStatus) emStatus.textContent = "Copied " + recipient + " to clipboard."; }); } },
    { label: "Toggle Light / Dark Theme (T)", group: "Action", run: function () { toggleTheme(); } },
    { label: "Open GitHub Profile", group: "Profile", run: function () { window.open("https://github.com/anthonycombalicer66-maker", "_blank", "noopener"); } },
    { label: "Open LinkedIn Profile", group: "Profile", run: function () { window.open("https://www.linkedin.com/in/anthony-combalicer-28a39a403", "_blank", "noopener"); } }
  ];

  function renderCommands(query) {
    if (!cmdList) return;
    var q = (query || "").trim().toLowerCase();
    filteredCommands = commands.filter(function (c) {
      return !q || c.label.toLowerCase().indexOf(q) !== -1 || c.group.toLowerCase().indexOf(q) !== -1;
    });
    cmdIndex = 0;
    cmdList.innerHTML = "";
    if (!filteredCommands.length) {
      var empty = document.createElement("li");
      empty.className = "cmd-empty";
      empty.textContent = "No matching commands.";
      cmdList.appendChild(empty);
      return;
    }
    filteredCommands.forEach(function (item, idx) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cmd-item" + (idx === 0 ? " is-selected" : "");
      var labelSpan = document.createElement("span");
      labelSpan.textContent = item.label;
      var groupSpan = document.createElement("span");
      groupSpan.className = "cmd-item-group";
      groupSpan.textContent = item.group;
      btn.appendChild(labelSpan);
      btn.appendChild(groupSpan);
      btn.addEventListener("mouseenter", function () {
        cmdIndex = idx;
        highlightCmd();
      });
      btn.addEventListener("click", function () {
        executeCmd(idx);
      });
      li.appendChild(btn);
      cmdList.appendChild(li);
    });
  }

  function highlightCmd() {
    if (!cmdList) return;
    var items = cmdList.querySelectorAll(".cmd-item");
    items.forEach(function (el, idx) {
      el.classList.toggle("is-selected", idx === cmdIndex);
      if (idx === cmdIndex && el.scrollIntoView) {
        el.scrollIntoView({ block: "nearest" });
      }
    });
  }

  function executeCmd(idx) {
    var chosen = filteredCommands[idx];
    if (!chosen || !cmdModal) return;
    cmdModal.close();
    chosen.run();
  }

  function openCmd() {
    if (!cmdModal) return;
    if (cmdInput) cmdInput.value = "";
    renderCommands("");
    cmdModal.showModal();
    if (cmdInput) cmdInput.focus();
  }

  if (cmdModal) {
    if (cmdTrigger) cmdTrigger.addEventListener("click", openCmd);
    document.querySelectorAll("[data-open-cmd]").forEach(function (el) {
      el.addEventListener("click", openCmd);
    });
    if (cmdClose) {
      cmdClose.addEventListener("click", function () {
        cmdModal.close();
      });
    }
    cmdModal.addEventListener("click", function (event) {
      if (event.target === cmdModal) cmdModal.close();
    });
    if (cmdInput) {
      cmdInput.addEventListener("input", function () {
        renderCommands(cmdInput.value);
      });
      cmdInput.addEventListener("keydown", function (event) {
        if (!filteredCommands.length) return;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          cmdIndex = (cmdIndex + 1) % filteredCommands.length;
          highlightCmd();
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          cmdIndex = (cmdIndex - 1 + filteredCommands.length) % filteredCommands.length;
          highlightCmd();
        } else if (event.key === "Enter") {
          event.preventDefault();
          executeCmd(cmdIndex);
        }
      });
    }

    document.addEventListener("keydown", function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (cmdModal.open) cmdModal.close();
        else openCmd();
        return;
      }

      var tag = document.activeElement ? document.activeElement.tagName : "";
      var isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (document.activeElement && document.activeElement.isContentEditable);
      var anyDialogOpen = document.querySelector("dialog[open]");
      if (isTyping || anyDialogOpen || event.metaKey || event.ctrlKey || event.altKey) return;

      var sectionMap = { "1": "#about", "2": "#activity", "3": "#skills", "4": "#projects", "5": "#contact" };
      if (sectionMap[event.key]) {
        location.hash = sectionMap[event.key];
      } else if (event.key.toLowerCase() === "t") {
        toggleTheme();
      }
    });
  }

  var heatmapEl = document.getElementById("gh-heatmap");
  var monthsEl = document.getElementById("gh-months");
  var heatReadout = document.getElementById("heat-readout");
  var repoStatEl = document.getElementById("gh-repo-stat");
  var updatedTagEl = document.getElementById("gh-updated-tag");
  var recentFeedEl = document.getElementById("gh-recent-feed");

  function toManilaDateKey(dateObj) {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(dateObj);
    } catch (e) {
      var y = dateObj.getFullYear();
      var m = String(dateObj.getMonth() + 1).padStart(2, "0");
      var d = String(dateObj.getDate()).padStart(2, "0");
      return y + "-" + m + "-" + d;
    }
  }

  function renderHeatmap(commitMap) {
    if (!heatmapEl) return;
    heatmapEl.innerHTML = "";
    if (monthsEl) monthsEl.innerHTML = "";

    var weeks = 12;
    var now = new Date();
    var todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var dayOfWeek = todayMidnight.getDay();
    var startSunday = new Date(todayMidnight.getFullYear(), todayMidnight.getMonth(), todayMidnight.getDate() - dayOfWeek - (weeks - 1) * 7);

    var frag = document.createDocumentFragment();
    var pattern = [0, 1, 2, 0, 1, 3, 1, 0, 2, 1, 0, 2, 4, 1, 0, 1, 2, 1, 0, 3, 2, 1, 0, 1, 2, 0, 3, 1];
    var lastMonth = -1;

    for (var w = 0; w < weeks; w++) {
      var colDate = new Date(startSunday.getFullYear(), startSunday.getMonth(), startSunday.getDate() + w * 7);
      if (monthsEl) {
        var mSpan = document.createElement("span");
        if (colDate.getMonth() !== lastMonth) {
          mSpan.textContent = colDate.toLocaleDateString("en-US", { month: "short" });
          lastMonth = colDate.getMonth();
        }
        monthsEl.appendChild(mSpan);
      }

      for (var dIdx = 0; dIdx < 7; dIdx++) {
        var cellDate = new Date(startSunday.getFullYear(), startSunday.getMonth(), startSunday.getDate() + w * 7 + dIdx);
        var isFuture = cellDate > todayMidnight;
        var key = toManilaDateKey(cellDate);
        var count = commitMap && commitMap[key] ? commitMap[key] : 0;
        var level = isFuture
          ? 0
          : commitMap
            ? (count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4)
            : pattern[(w * 7 + dIdx) % pattern.length];

        var cell = document.createElement("button");
        cell.type = "button";
        cell.className = "heat-cell lv-" + level;
        var dateText = cellDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        var labelText = isFuture
          ? dateText + " — Upcoming"
          : commitMap
            ? dateText + " — " + (count ? count + " contribution" + (count > 1 ? "s" : "") : "No public activity logged")
            : dateText + " — " + (level === 0 ? "Rest / planning" : level === 1 ? "Light iteration" : level === 2 ? "Feature build" : "Heavy shipping session");

        cell.setAttribute("aria-label", labelText);
        cell.setAttribute("data-info", labelText);
        cell.addEventListener("mouseenter", function (ev) {
          if (heatReadout) heatReadout.textContent = ev.currentTarget.getAttribute("data-info");
        });
        cell.addEventListener("focus", function (ev) {
          if (heatReadout) heatReadout.textContent = ev.currentTarget.getAttribute("data-info");
        });
        frag.appendChild(cell);
      }
    }
    heatmapEl.appendChild(frag);
  }

  renderHeatmap(null);

  function renderRecentFeed(events) {
    if (!recentFeedEl || !Array.isArray(events) || !events.length) return;
    recentFeedEl.innerHTML = "";
    events.slice(0, 3).forEach(function (ev) {
      if (!ev || !ev.repo) return;
      var repoShort = ev.repo.name.replace(ghUser + "/", "");
      var msg = ev.type.replace("Event", "");
      if (ev.type === "PushEvent" && ev.payload && Array.isArray(ev.payload.commits) && ev.payload.commits.length) {
        msg = ev.payload.commits[ev.payload.commits.length - 1].message.split("\n")[0];
      } else if (ev.type === "CreateEvent" && ev.payload && ev.payload.ref_type) {
        msg = "Created " + ev.payload.ref_type + (ev.payload.ref ? " " + ev.payload.ref : "");
      }
      var dateLabel = ev.created_at
        ? new Date(ev.created_at).toLocaleDateString("en-US", { timeZone: "Asia/Manila", month: "short", day: "numeric" })
        : "";

      var a = document.createElement("a");
      a.className = "feed-item";
      a.href = "https://github.com/" + ev.repo.name;
      a.target = "_blank";
      a.rel = "noopener";
      var topDiv = document.createElement("div");
      topDiv.className = "feed-top";
      var repoSpan = document.createElement("span");
      repoSpan.textContent = repoShort;
      var timeSpan = document.createElement("span");
      timeSpan.className = "feed-time";
      timeSpan.textContent = dateLabel;
      topDiv.appendChild(repoSpan);
      topDiv.appendChild(timeSpan);
      var msgDiv = document.createElement("div");
      msgDiv.className = "feed-msg";
      msgDiv.textContent = msg;
      a.appendChild(topDiv);
      a.appendChild(msgDiv);
      recentFeedEl.appendChild(a);
    });
  }

  (function loadGitHubLive() {
    var cacheKey = "gh_snapshot_v2";
    function applyData(profile, events, repos) {
      if (profile && typeof profile.public_repos === "number" && repoStatEl) {
        repoStatEl.textContent = profile.public_repos + " Public Repos";
      }
      if (Array.isArray(events) && events.length) {
        var counts = {};
        events.forEach(function (ev) {
          if (ev && ev.created_at) {
            var day = toManilaDateKey(new Date(ev.created_at));
            var weight = 1;
            if (ev.type === "PushEvent" && ev.payload) {
              weight = typeof ev.payload.size === "number" && ev.payload.size > 0
                ? ev.payload.size
                : Array.isArray(ev.payload.commits) && ev.payload.commits.length
                  ? ev.payload.commits.length
                  : 1;
            }
            counts[day] = (counts[day] || 0) + weight;
          }
        });
        renderHeatmap(counts);
        renderRecentFeed(events);
        if (updatedTagEl && events[0] && events[0].created_at) {
          var latest = new Date(events[0].created_at).toLocaleDateString("en-US", {
            timeZone: "Asia/Manila",
            month: "short",
            day: "numeric"
          });
          updatedTagEl.textContent = "Synced · Latest push " + latest;
        }
      }
      if (Array.isArray(repos) && repos.length) {
        var repoMap = {};
        repos.forEach(function (r) {
          if (r && r.name) repoMap[r.name] = r;
        });
        document.querySelectorAll("[data-repo]").forEach(function (card) {
          var repoName = card.getAttribute("data-repo");
          var info = repoMap[repoName];
          var stamp = card.querySelector("[data-repo-stamp]");
          if (info && stamp && info.pushed_at) {
            var pushed = new Date(info.pushed_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });
            var stars = info.stargazers_count > 0 ? " · ★ " + info.stargazers_count : "";
            stamp.textContent = "· Updated " + pushed + stars;
          }
        });
      }
    }

    try {
      var cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        var parsed = JSON.parse(cached);
        if (parsed && Date.now() - parsed.ts < 600000) {
          applyData(parsed.profile, parsed.events, parsed.repos);
          return;
        }
      }
    } catch (e) {}

    if (typeof fetch !== "function") return;

    Promise.all([
      fetch("https://api.github.com/users/" + ghUser).then(function (r) { return r.ok ? r.json() : null; }),
      fetch("https://api.github.com/users/" + ghUser + "/events/public?per_page=100").then(function (r) { return r.ok ? r.json() : null; }),
      fetch("https://api.github.com/users/" + ghUser + "/repos?sort=updated&per_page=20").then(function (r) { return r.ok ? r.json() : null; })
    ]).then(function (res) {
      var profile = res[0];
      var events = res[1];
      var repos = res[2];
      if (profile || events || repos) {
        applyData(profile, events, repos);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), profile: profile, events: events, repos: repos }));
        } catch (e) {}
      }
    }).catch(function () {});
  })();

  var sectionNavLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var observedSections = sectionNavLinks
    .map(function (link) {
      var id = link.getAttribute("href").slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && observedSections.length) {
    var setActiveNav = function (id) {
      sectionNavLinks.forEach(function (link) {
        var match = link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-active", match);
        if (match) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 }
    );

    observedSections.forEach(function (sec) {
      observer.observe(sec);
    });
  }
})();
