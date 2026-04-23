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

  function renderTasks(container, tasks) {
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

      if (task.pages) {
        metaParts.push("Sayfa " + escapeHtml(task.pages));
      }

      if (task.estimatedTime) {
        metaParts.push(escapeHtml(task.estimatedTime));
      }

      return [
        '<article class="task-item' + (task.completed ? " is-complete" : "") + '" data-task-id="' + escapeHtml(task.id) + '">',
        '  <input class="task-checkbox" type="checkbox" aria-label="Görevi tamamlandı olarak işaretle" ' + (task.completed ? "checked" : "") + '/>',
        '  <div class="min-w-0 flex-1">',
        '    <div class="flex flex-wrap items-center gap-x-3 gap-y-1">',
        '      <span class="font-label-sm text-label-sm uppercase tracking-[0.18em] text-[#5F7A76]">' + escapeHtml(task.subject) + '</span>',
        '      <span class="task-meta text-sm text-on-surface-variant">' + escapeHtml(metaParts.join(" · ")) + '</span>',
        '    </div>',
        '    <h3 class="task-title mt-1 font-h3 text-[26px] leading-[1.2] text-on-surface">' + escapeHtml(task.topic) + '</h3>',
        (task.notes ? '    <p class="task-notes mt-2 text-on-surface-variant">' + escapeHtml(task.notes) + '</p>' : ""),
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
