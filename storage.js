(function () {
  var TASKS_KEY = "studyJournal.tasks";
  var JOURNAL_KEY = "studyJournal.journal";
  var DEFAULT_JOURNAL = {
    focus: "",
    notes: "",
    style: "lined",
    handwritingData: ""
  };

  function parseEstimatedTimeToSeconds(value) {
    var input = String(value || "").trim().toLowerCase();

    if (!input) {
      return 0;
    }

    var totalSeconds = 0;
    var matchedAny = false;
    var hourMatches = input.match(/(\d+)\s*(saat|sa|hour|hours|h)\b/g) || [];
    var minuteMatches = input.match(/(\d+)\s*(dakika|dk|dak|minute|minutes|min)\b/g) || [];
    var secondMatches = input.match(/(\d+)\s*(saniye|sn|sec|second|seconds|s)\b/g) || [];
    var colonMatch = input.match(/^(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?$/);

    if (colonMatch) {
      matchedAny = true;
      totalSeconds += Number(colonMatch[1]) * 60 * 60;
      totalSeconds += Number(colonMatch[2]) * 60;
      totalSeconds += Number(colonMatch[3] || 0);
    }

    hourMatches.forEach(function (item) {
      var valueMatch = item.match(/\d+/);
      if (!valueMatch) {
        return;
      }
      matchedAny = true;
      totalSeconds += Number(valueMatch[0]) * 60 * 60;
    });

    minuteMatches.forEach(function (item) {
      var valueMatch = item.match(/\d+/);
      if (!valueMatch) {
        return;
      }
      matchedAny = true;
      totalSeconds += Number(valueMatch[0]) * 60;
    });

    secondMatches.forEach(function (item) {
      var valueMatch = item.match(/\d+/);
      if (!valueMatch) {
        return;
      }
      matchedAny = true;
      totalSeconds += Number(valueMatch[0]);
    });

    if (!matchedAny && /^\d+$/.test(input)) {
      totalSeconds = Number(input) * 60;
    }

    return totalSeconds;
  }

  function normalizeTask(task) {
    var parsedDuration = Number(task.estimatedDurationSeconds) || parseEstimatedTimeToSeconds(task.estimatedTime);
    var remainingSeconds = Number(task.remainingSeconds);

    if (!remainingSeconds && parsedDuration) {
      remainingSeconds = parsedDuration;
    }

    return Object.assign({}, task, {
      estimatedDurationSeconds: parsedDuration,
      remainingSeconds: remainingSeconds || 0,
      timerRunning: Boolean(task.timerRunning && task.timerEndsAt),
      timerEndsAt: task.timerEndsAt || null,
      timerFinished: Boolean(task.timerFinished)
    });
  }

  function safeParse(value, fallback) {
    if (!value) {
      return fallback;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function readTasks() {
    var tasks = safeParse(localStorage.getItem(TASKS_KEY), []);
    return Array.isArray(tasks) ? tasks.map(normalizeTask) : [];
  }

  function writeTasks(tasks) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return tasks;
  }

  function readJournal() {
    var stored = safeParse(localStorage.getItem(JOURNAL_KEY), {});
    return Object.assign({}, DEFAULT_JOURNAL, stored);
  }

  function writeJournal(patch) {
    var nextValue = Object.assign({}, readJournal(), patch || {});
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(nextValue));
    return nextValue;
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return "task-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function addTask(taskInput) {
    var tasks = readTasks();
    var estimatedDurationSeconds = parseEstimatedTimeToSeconds(taskInput.estimatedTime);
    var task = {
      id: createId(),
      subject: taskInput.subject,
      topic: taskInput.topic,
      pages: taskInput.pages || "",
      estimatedTime: taskInput.estimatedTime,
      estimatedDurationSeconds: estimatedDurationSeconds,
      remainingSeconds: estimatedDurationSeconds,
      timerRunning: false,
      timerEndsAt: null,
      timerFinished: false,
      notes: taskInput.notes || "",
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.unshift(task);
    writeTasks(tasks);
    return task;
  }

  function toggleTask(taskId) {
    var tasks = readTasks().map(function (task) {
      if (task.id !== taskId) {
        return task;
      }

      return Object.assign({}, task, {
        completed: !task.completed,
        timerRunning: false,
        timerEndsAt: null
      });
    });

    writeTasks(tasks);
    return tasks;
  }

  function updateTask(taskId, patch) {
    var tasks = readTasks().map(function (task) {
      if (task.id !== taskId) {
        return task;
      }

      return Object.assign({}, task, patch || {});
    });

    writeTasks(tasks);
    return tasks;
  }

  function deleteTask(taskId) {
    var tasks = readTasks().filter(function (task) {
      return task.id !== taskId;
    });

    writeTasks(tasks);
    return tasks;
  }

  function getProgress(tasks) {
    var total = tasks.length;
    var completed = tasks.filter(function (task) {
      return Boolean(task.completed);
    }).length;
    var percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total: total,
      completed: completed,
      percentage: percentage
    };
  }

  function setFlashMessage(message) {
    sessionStorage.setItem("studyJournal.flash", message);
  }

  function consumeFlashMessage() {
    var message = sessionStorage.getItem("studyJournal.flash");
    if (message) {
      sessionStorage.removeItem("studyJournal.flash");
    }
    return message;
  }

  window.StudyJournalStorage = {
    addTask: addTask,
    consumeFlashMessage: consumeFlashMessage,
    getJournal: readJournal,
    getProgress: getProgress,
    getTasks: readTasks,
    deleteTask: deleteTask,
    parseEstimatedTimeToSeconds: parseEstimatedTimeToSeconds,
    setFlashMessage: setFlashMessage,
    updateTask: updateTask,
    updateJournal: writeJournal,
    toggleTask: toggleTask
  };
})();
