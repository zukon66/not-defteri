(function () {
  var STYLE_CLASS_MAP = {
    lined: "notebook-lined",
    grid: "notebook-grid",
    plain: "notebook-plain"
  };

  var STYLE_LABEL_MAP = {
    lined: "Çizgili Sayfa",
    grid: "Kareli Sayfa",
    plain: "Düz Not Modu"
  };

  var STYLE_CHIP_MAP = {
    lined: "Çizgili",
    grid: "Kareli",
    plain: "Düz"
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDuration(totalSeconds) {
    var safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    var hours = Math.floor(safeSeconds / 3600);
    var minutes = Math.floor((safeSeconds % 3600) / 60);
    var seconds = safeSeconds % 60;

    if (hours > 0) {
      return [hours, minutes, seconds].map(function (part, index) {
        return index === 0 ? String(part) : String(part).padStart(2, "0");
      }).join(":");
    }

    return [minutes, seconds].map(function (part) {
      return String(part).padStart(2, "0");
    }).join(":");
  }

  function renderTasks(container, tasks, now) {
    if (!container) {
      return;
    }

    if (!tasks.length) {
      container.innerHTML = [
        '<div class="empty-state">',
        '  <div>',
        '    <strong>Henüz görev yok</strong>',
        '    <p>Bugünün planını oluşturmak için ilk görevini ekle.</p>',
        '  </div>',
        '</div>'
      ].join("");
      return;
    }

    container.innerHTML = tasks.map(function (task) {
      var metaParts = [];
      var currentRemainingSeconds = Number(task.remainingSeconds) || 0;
      var hasTimer = Number(task.estimatedDurationSeconds) > 0;
      var isRunning = Boolean(task.timerRunning && task.timerEndsAt);

      if (isRunning) {
        currentRemainingSeconds = Math.max(0, Math.ceil((new Date(task.timerEndsAt).getTime() - now) / 1000));
      }

      if (task.pages) {
        metaParts.push("Sayfa " + escapeHtml(task.pages));
      }

      if (task.estimatedTime && !hasTimer) {
        metaParts.push(escapeHtml(task.estimatedTime));
      }

      if (hasTimer) {
        metaParts.push("Süre " + escapeHtml(task.estimatedTime));
      }

      return [
        '<article class="task-item' + (task.completed ? " is-complete" : "") + '" data-task-id="' + escapeHtml(task.id) + '">',
        '  <input class="task-checkbox" type="checkbox" aria-label="Görevi tamamlandı olarak işaretle" ' + (task.completed ? "checked" : "") + '/>',
        '  <div class="min-w-0 flex-1">',
        '    <div class="flex flex-wrap items-start justify-between gap-3">',
        '      <div class="min-w-0">',
        '        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">',
        '          <span class="font-label-sm text-label-sm uppercase tracking-[0.18em] text-[#5F7A76]">' + escapeHtml(task.subject) + '</span>',
        '          <span class="task-meta text-sm text-on-surface-variant">' + escapeHtml(metaParts.join(" · ")) + '</span>',
        '        </div>',
        '      </div>',
        '      <div class="task-item-actions">',
        '        <button class="task-card-action" data-task-action="edit" type="button" aria-label="Görevi düzenle">',
        '          <span class="material-symbols-outlined text-[18px]">edit</span>',
        '        </button>',
        '        <button class="task-card-action task-card-action--danger" data-task-action="delete" type="button" aria-label="Görevi sil">',
        '          <span class="material-symbols-outlined text-[18px]">delete</span>',
        '        </button>',
        '      </div>',
        '    </div>',
        '    <h3 class="task-title mt-1 font-h3 text-[26px] leading-[1.2] text-on-surface">' + escapeHtml(task.topic) + '</h3>',
        (task.notes ? '    <p class="task-notes mt-2 text-on-surface-variant">' + escapeHtml(task.notes) + '</p>' : ""),
        (hasTimer ? [
        '    <div class="timer-panel mt-3">',
        '      <div class="timer-readout-wrap">',
        '        <span class="timer-label">Geri Sayım</span>',
        '        <strong class="timer-readout' + (task.timerFinished ? " is-finished" : "") + '">' + escapeHtml(formatDuration(currentRemainingSeconds)) + '</strong>',
        (task.timerFinished ? '        <span class="timer-finished-text">Süre doldu</span>' : ""),
        '      </div>',
        '      <div class="timer-actions">',
        '        <button class="timer-action timer-action--primary" data-timer-action="' + (isRunning ? "pause" : "start") + '" type="button">' + (isRunning ? "Duraklat" : (task.timerFinished ? "Yeniden Başlat" : "Başlat")) + '</button>',
        '        <button class="timer-action" data-timer-action="reset" type="button">Sıfırla</button>',
        '      </div>',
        '    </div>'
        ].join("") : ""),
        '  </div>',
        '</article>'
      ].join("");
    }).join("");
  }

  function applyNotebookStyle(element, style) {
    if (!element) {
      return;
    }

    Object.keys(STYLE_CLASS_MAP).forEach(function (key) {
      element.classList.remove(STYLE_CLASS_MAP[key]);
    });

    element.classList.add(STYLE_CLASS_MAP[style] || STYLE_CLASS_MAP.lined);
  }

  function syncStyleOptions(options, activeStyle) {
    options.forEach(function (option) {
      var isActive = option.dataset.style === activeStyle;
      option.dataset.active = isActive ? "true" : "false";
    });
  }

  function setFeedbackMessage(element, message, variant) {
    if (!element) {
      return;
    }

    if (!message) {
      element.textContent = "";
      element.classList.add("hidden");
      element.classList.remove("is-success", "is-error");
      return;
    }

    element.textContent = message;
    element.classList.remove("hidden", "is-success", "is-error");
    element.classList.add(variant === "error" ? "is-error" : "is-success");
  }

  window.StudyJournalUI = {
    applyNotebookStyle: applyNotebookStyle,
    renderTasks: renderTasks,
    setFeedbackMessage: setFeedbackMessage,
    styleChipFor: function (style) {
      return STYLE_CHIP_MAP[style] || STYLE_CHIP_MAP.lined;
    },
    styleLabelFor: function (style) {
      return STYLE_LABEL_MAP[style] || STYLE_LABEL_MAP.lined;
    },
    syncStyleOptions: syncStyleOptions
  };
})();
