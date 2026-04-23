(function () {
  var storage = window.StudyJournalStorage;
  var ui = window.StudyJournalUI;

  if (!storage || !ui) {
    return;
  }

  function formatToday() {
    var formatter = new Intl.DateTimeFormat("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });

    return formatter.format(new Date());
  }

  function initPlannerPage() {
    var taskList = document.getElementById("task-list");
    var totalElement = document.getElementById("task-total");
    var completedElement = document.getElementById("task-completed");
    var percentElement = document.getElementById("task-percent");
    var progressBar = document.getElementById("progress-bar");
    var notebookSurface = document.getElementById("notebook-surface");
    var notebookStyleLabel = document.getElementById("notebook-style-label");
    var notebookStyleChip = document.getElementById("notebook-style-chip");
    var focusInput = document.getElementById("today-focus");
    var notesInput = document.getElementById("daily-notes");
    var plannerDateLabel = document.getElementById("planner-date-label");
    var flashMessage = document.getElementById("flash-message");
    var drawingOverlay = document.getElementById("drawing-overlay");
    var drawingPaper = document.getElementById("drawing-paper");
    var drawingCanvas = document.getElementById("drawing-canvas");
    var drawingHint = document.getElementById("drawing-hint");
    var openDrawingModeButton = document.getElementById("open-drawing-mode");
    var closeDrawingModeButton = document.getElementById("close-drawing-mode");
    var clearDrawingButton = document.getElementById("clear-drawing");
    var editTaskModal = document.getElementById("edit-task-modal");
    var editTaskForm = document.getElementById("edit-task-form");
    var editTaskMessage = document.getElementById("edit-task-message");
    var editTaskIdInput = document.getElementById("edit-task-id");
    var editSubjectInput = document.getElementById("edit-subject");
    var editTopicInput = document.getElementById("edit-topic");
    var editPagesInput = document.getElementById("edit-pages");
    var editEstimatedTimeInput = document.getElementById("edit-estimated-time");
    var editNotesInput = document.getElementById("edit-notes");
    var cancelEditTaskButton = document.getElementById("cancel-edit-task");
    var canvasContext = drawingCanvas ? drawingCanvas.getContext("2d") : null;
    var isDrawing = false;
    var lastPoint = null;
    var timerIntervalId = null;
    var audioContext = null;
    var activeAlertTaskIds = {};

    function ensureAudioContext() {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        return null;
      }

      if (!audioContext) {
        audioContext = new AudioContextClass();
      }

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      return audioContext;
    }

    function playTimerAlert() {
      var context = ensureAudioContext();

      if (navigator.vibrate) {
        navigator.vibrate([220, 120, 220, 120, 360]);
      }

      if (!context) {
        return;
      }

      [0, 0.22, 0.44].forEach(function (offset, index) {
        var oscillator = context.createOscillator();
        var gainNode = context.createGain();
        var startAt = context.currentTime + offset;
        var duration = index === 2 ? 0.36 : 0.18;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(index === 2 ? 1046 : 880, startAt);
        gainNode.gain.setValueAtTime(0.0001, startAt);
        gainNode.gain.exponentialRampToValueAtTime(0.18, startAt + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + duration);
      });
    }

    function getRemainingSeconds(task, now) {
      if (task.timerRunning && task.timerEndsAt) {
        return Math.max(0, Math.ceil((new Date(task.timerEndsAt).getTime() - now) / 1000));
      }

      return Number(task.remainingSeconds) || 0;
    }

    function render() {
      var tasks = storage.getTasks();
      var journal = storage.getJournal();
      var progress = storage.getProgress(tasks);
      var now = Date.now();

      ui.renderTasks(taskList, tasks, now);
      totalElement.textContent = String(progress.total);
      completedElement.textContent = String(progress.completed);
      percentElement.textContent = progress.percentage + "%";
      progressBar.style.width = progress.percentage + "%";
      ui.applyNotebookStyle(notebookSurface, journal.style);
      ui.applyNotebookStyle(drawingPaper, journal.style);
      notebookStyleLabel.textContent = ui.styleLabelFor(journal.style);
      notebookStyleChip.textContent = ui.styleChipFor(journal.style);

      if (focusInput.value !== journal.focus) {
        focusInput.value = journal.focus;
      }

      if (notesInput.value !== journal.notes) {
        notesInput.value = journal.notes;
      }
    }

    function syncExpiredTimers() {
      var tasks = storage.getTasks();
      var now = Date.now();
      var expiredTasks = tasks.filter(function (task) {
        return task.timerRunning && task.timerEndsAt && new Date(task.timerEndsAt).getTime() <= now;
      });

      if (!expiredTasks.length) {
        return false;
      }

      expiredTasks.forEach(function (task) {
        storage.updateTask(task.id, {
          remainingSeconds: 0,
          timerRunning: false,
          timerEndsAt: null,
          timerFinished: true
        });

        if (!activeAlertTaskIds[task.id]) {
          activeAlertTaskIds[task.id] = true;
          playTimerAlert();
          ui.setFeedbackMessage(flashMessage, "“" + task.topic + "” için süre doldu.", "success");
        }
      });

      return true;
    }

    function startTimerLoop() {
      if (timerIntervalId) {
        return;
      }

      timerIntervalId = window.setInterval(function () {
        var didExpire = syncExpiredTimers();
        render();

        if (didExpire) {
          return;
        }

        var hasRunningTimer = storage.getTasks().some(function (task) {
          return task.timerRunning && task.timerEndsAt;
        });

        if (!hasRunningTimer) {
          clearInterval(timerIntervalId);
          timerIntervalId = null;
        }
      }, 1000);
    }

    function beginTaskTimer(taskId) {
      var tasks = storage.getTasks();
      var task = tasks.find(function (item) {
        return item.id === taskId;
      });

      if (!task || !task.estimatedDurationSeconds) {
        return;
      }

      ensureAudioContext();
      activeAlertTaskIds[taskId] = false;

      var baseRemaining = getRemainingSeconds(task, Date.now()) || task.estimatedDurationSeconds;
      storage.updateTask(taskId, {
        remainingSeconds: baseRemaining,
        timerRunning: true,
        timerFinished: false,
        timerEndsAt: new Date(Date.now() + (baseRemaining * 1000)).toISOString()
      });
      startTimerLoop();
      render();
    }

    function pauseTaskTimer(taskId) {
      var tasks = storage.getTasks();
      var task = tasks.find(function (item) {
        return item.id === taskId;
      });

      if (!task) {
        return;
      }

      storage.updateTask(taskId, {
        remainingSeconds: getRemainingSeconds(task, Date.now()),
        timerRunning: false,
        timerEndsAt: null
      });
      render();
    }

    function resetTaskTimer(taskId) {
      var tasks = storage.getTasks();
      var task = tasks.find(function (item) {
        return item.id === taskId;
      });

      if (!task) {
        return;
      }

      activeAlertTaskIds[taskId] = false;
      storage.updateTask(taskId, {
        remainingSeconds: task.estimatedDurationSeconds || 0,
        timerRunning: false,
        timerEndsAt: null,
        timerFinished: false
      });
      render();
    }

    function getStoredDrawing() {
      return storage.getJournal().handwritingData || "";
    }

    function saveDrawing() {
      if (!drawingCanvas) {
        return;
      }

      storage.updateJournal({
        handwritingData: drawingCanvas.toDataURL("image/png")
      });
    }

    function drawStoredImage() {
      var storedImage = getStoredDrawing();
      var bounds = drawingCanvas.getBoundingClientRect();

      if (!canvasContext || !drawingCanvas) {
        return;
      }

      canvasContext.clearRect(0, 0, bounds.width, bounds.height);

      if (!storedImage) {
        if (drawingHint) {
          drawingHint.classList.remove("hidden");
        }
        return;
      }

      var image = new Image();
      image.onload = function () {
        canvasContext.clearRect(0, 0, bounds.width, bounds.height);
        canvasContext.drawImage(image, 0, 0, bounds.width, bounds.height);
        if (drawingHint) {
          drawingHint.classList.add("hidden");
        }
      };
      image.src = storedImage;
    }

    function resizeDrawingCanvas() {
      if (!drawingCanvas || !drawingPaper || !canvasContext) {
        return;
      }

      var ratio = window.devicePixelRatio || 1;
      var bounds = drawingPaper.getBoundingClientRect();
      drawingCanvas.width = Math.max(1, Math.floor(bounds.width * ratio));
      drawingCanvas.height = Math.max(1, Math.floor(bounds.height * ratio));
      canvasContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      canvasContext.lineCap = "round";
      canvasContext.lineJoin = "round";
      canvasContext.lineWidth = 2.2;
      canvasContext.strokeStyle = "#30404d";
      drawStoredImage();
    }

    function pointFromEvent(event) {
      var bounds = drawingCanvas.getBoundingClientRect();
      return {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top
      };
    }

    function startStroke(event) {
      if (!canvasContext || !drawingCanvas) {
        return;
      }

      event.preventDefault();
      isDrawing = true;
      lastPoint = pointFromEvent(event);
      canvasContext.beginPath();
      canvasContext.moveTo(lastPoint.x, lastPoint.y);
      if (drawingHint) {
        drawingHint.classList.add("hidden");
      }
      drawingCanvas.setPointerCapture(event.pointerId);
    }

    function moveStroke(event) {
      if (!isDrawing || !canvasContext) {
        return;
      }

      event.preventDefault();
      var nextPoint = pointFromEvent(event);
      canvasContext.lineTo(nextPoint.x, nextPoint.y);
      canvasContext.stroke();
      lastPoint = nextPoint;
    }

    function endStroke(event) {
      if (!isDrawing) {
        return;
      }

      isDrawing = false;
      lastPoint = null;
      if (drawingCanvas) {
        drawingCanvas.releasePointerCapture(event.pointerId);
      }
      saveDrawing();
    }

    function openDrawingMode() {
      drawingOverlay.classList.add("is-open");
      drawingOverlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("overlay-open");
      resizeDrawingCanvas();
    }

    function closeDrawingMode() {
      drawingOverlay.classList.remove("is-open");
      drawingOverlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("overlay-open");
    }

    function openEditTaskModal(task) {
      editTaskIdInput.value = task.id;
      editSubjectInput.value = task.subject || "";
      editTopicInput.value = task.topic || "";
      editPagesInput.value = task.pages || "";
      editEstimatedTimeInput.value = task.estimatedTime || "";
      editNotesInput.value = task.notes || "";
      ui.setFeedbackMessage(editTaskMessage, "", "success");
      editTaskModal.classList.add("is-open");
      editTaskModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("overlay-open");
    }

    function closeEditTaskModal() {
      editTaskModal.classList.remove("is-open");
      editTaskModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("overlay-open");
      ui.setFeedbackMessage(editTaskMessage, "", "success");
    }

    plannerDateLabel.textContent = formatToday();

    var flash = storage.consumeFlashMessage();
    if (flash) {
      ui.setFeedbackMessage(flashMessage, flash, "success");
    }

    taskList.addEventListener("change", function (event) {
      if (!event.target.classList.contains("task-checkbox")) {
        return;
      }

      var taskItem = event.target.closest("[data-task-id]");
      if (!taskItem) {
        return;
      }

      storage.toggleTask(taskItem.dataset.taskId);
      render();
    });

    taskList.addEventListener("click", function (event) {
      var taskActionButton = event.target.closest("[data-task-action]");
      if (taskActionButton) {
        var actionTaskItem = taskActionButton.closest("[data-task-id]");
        var actionTaskId = actionTaskItem ? actionTaskItem.dataset.taskId : "";
        var actionTask = storage.getTasks().find(function (task) {
          return task.id === actionTaskId;
        });

        if (!actionTask) {
          return;
        }

        if (taskActionButton.dataset.taskAction === "edit") {
          openEditTaskModal(actionTask);
          return;
        }

        if (taskActionButton.dataset.taskAction === "delete") {
          if (!window.confirm("Bu görevi silmek istediğine emin misin?")) {
            return;
          }

          storage.deleteTask(actionTask.id);
          ui.setFeedbackMessage(flashMessage, "Görev silindi.", "success");
          render();
          return;
        }
      }

      var actionButton = event.target.closest("[data-timer-action]");
      if (!actionButton) {
        return;
      }

      var taskItem = actionButton.closest("[data-task-id]");
      if (!taskItem) {
        return;
      }

      var taskId = taskItem.dataset.taskId;
      var action = actionButton.dataset.timerAction;

      if (action === "start") {
        beginTaskTimer(taskId);
      }

      if (action === "pause") {
        pauseTaskTimer(taskId);
      }

      if (action === "reset") {
        resetTaskTimer(taskId);
      }
    });

    focusInput.addEventListener("input", function (event) {
      storage.updateJournal({ focus: event.target.value.trimStart() });
    });

    notesInput.addEventListener("input", function (event) {
      storage.updateJournal({ notes: event.target.value });
    });

    if (drawingCanvas && canvasContext && drawingPaper) {
      resizeDrawingCanvas();
      drawingCanvas.addEventListener("pointerdown", startStroke);
      drawingCanvas.addEventListener("pointermove", moveStroke);
      drawingCanvas.addEventListener("pointerup", endStroke);
      drawingCanvas.addEventListener("pointercancel", endStroke);
      window.addEventListener("resize", function () {
        if (drawingOverlay.classList.contains("is-open")) {
          resizeDrawingCanvas();
        }
      });
    }

    if (openDrawingModeButton) {
      openDrawingModeButton.addEventListener("click", openDrawingMode);
    }

    if (closeDrawingModeButton) {
      closeDrawingModeButton.addEventListener("click", closeDrawingMode);
    }

    if (clearDrawingButton) {
      clearDrawingButton.addEventListener("click", function () {
        if (!canvasContext || !drawingCanvas) {
          return;
        }

        canvasContext.clearRect(0, 0, drawingCanvas.clientWidth, drawingCanvas.clientHeight);
        storage.updateJournal({ handwritingData: "" });
        if (drawingHint) {
          drawingHint.classList.remove("hidden");
        }
      });
    }

    if (cancelEditTaskButton) {
      cancelEditTaskButton.addEventListener("click", closeEditTaskModal);
    }

    if (editTaskModal) {
      editTaskModal.addEventListener("click", function (event) {
        if (event.target === editTaskModal) {
          closeEditTaskModal();
        }
      });
    }

    if (editTaskForm) {
      editTaskForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var taskId = editTaskIdInput.value;
        var subject = editSubjectInput.value.trim();
        var topic = editTopicInput.value.trim();
        var pages = editPagesInput.value.trim();
        var estimatedTime = editEstimatedTimeInput.value.trim();
        var notes = editNotesInput.value.trim();
        var estimatedDurationSeconds = storage.parseEstimatedTimeToSeconds(estimatedTime);
        var existingTask = storage.getTasks().find(function (task) {
          return task.id === taskId;
        });

        if (!existingTask) {
          ui.setFeedbackMessage(editTaskMessage, "Görev bulunamadı.", "error");
          return;
        }

        if (!subject || !topic || !estimatedTime) {
          ui.setFeedbackMessage(editTaskMessage, "Ders, konu ve tahmini süre alanları zorunludur.", "error");
          return;
        }

        if (!estimatedDurationSeconds) {
          ui.setFeedbackMessage(editTaskMessage, "Tahmini süreyi “45 dk” veya “1 saat 20 dk” gibi gir.", "error");
          return;
        }

        storage.updateTask(taskId, {
          subject: subject,
          topic: topic,
          pages: pages,
          estimatedTime: estimatedTime,
          estimatedDurationSeconds: estimatedDurationSeconds,
          remainingSeconds: estimatedDurationSeconds,
          timerRunning: false,
          timerEndsAt: null,
          timerFinished: false,
          notes: notes,
          completed: existingTask.completed
        });

        closeEditTaskModal();
        ui.setFeedbackMessage(flashMessage, "Görev güncellendi.", "success");
        render();
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && drawingOverlay.classList.contains("is-open")) {
        closeDrawingMode();
      }

      if (event.key === "Escape" && editTaskModal.classList.contains("is-open")) {
        closeEditTaskModal();
      }
    });

    if (storage.getTasks().some(function (task) { return task.timerRunning && task.timerEndsAt; })) {
      startTimerLoop();
    }

    render();
  }

  function initTaskFormPage() {
    var form = document.getElementById("task-form");
    var formMessage = document.getElementById("form-message");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var formData = new FormData(form);
      var subject = String(formData.get("subject") || "").trim();
      var topic = String(formData.get("topic") || "").trim();
      var pages = String(formData.get("pages") || "").trim();
      var estimatedTime = String(formData.get("estimatedTime") || "").trim();
      var notes = String(formData.get("notes") || "").trim();
      var estimatedDurationSeconds = storage.parseEstimatedTimeToSeconds(estimatedTime);

      if (!subject || !topic || !estimatedTime) {
        ui.setFeedbackMessage(formMessage, "Ders, konu ve tahmini süre alanları zorunludur.", "error");
        return;
      }

      if (!estimatedDurationSeconds) {
        ui.setFeedbackMessage(formMessage, "Tahmini süreyi “45 dk” veya “1 saat 20 dk” gibi gir.", "error");
        return;
      }

      storage.addTask({
        subject: subject,
        topic: topic,
        pages: pages,
        estimatedTime: estimatedTime,
        notes: notes
      });

      storage.setFlashMessage("Görev kaydedildi. Planlayıcın güncellendi.");
      window.location.href = "./sayfa1.html";
    });
  }

  function initStyleSettingsPage() {
    var options = Array.prototype.slice.call(document.querySelectorAll("[data-style-option]"));
    var applyButton = document.getElementById("apply-style-button");
    var styleMessage = document.getElementById("style-message");
    var currentStyle = storage.getJournal().style;

    ui.syncStyleOptions(options, currentStyle);

    options.forEach(function (option) {
      option.addEventListener("click", function () {
        currentStyle = option.dataset.style || "lined";
        ui.syncStyleOptions(options, currentStyle);
      });
    });

    applyButton.addEventListener("click", function () {
      storage.updateJournal({ style: currentStyle });
      ui.setFeedbackMessage(styleMessage, ui.styleLabelFor(currentStyle) + " seçildi. Defter görünümü güncellendi.", "success");
    });
  }

  var page = document.body.dataset.page;

  if (page === "planner") {
    initPlannerPage();
  }

  if (page === "task-form") {
    initTaskFormPage();
  }

  if (page === "style-settings") {
    initStyleSettingsPage();
  }
})();
