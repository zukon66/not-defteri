(function () {
  var TASKS_KEY = "studyJournal.tasks";
  var JOURNAL_KEY = "studyJournal.journal";
  var DEFAULT_JOURNAL = {
    focus: "",
    notes: "",
    style: "lined",
    handwritingData: ""
  };

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
    return Array.isArray(tasks) ? tasks : [];
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
    var task = {
      id: createId(),
      subject: taskInput.subject,
      topic: taskInput.topic,
      pages: taskInput.pages || "",
      estimatedTime: taskInput.estimatedTime,
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
        completed: !task.completed
      });
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
    setFlashMessage: setFlashMessage,
    updateJournal: writeJournal,
    toggleTask: toggleTask
  };
})();
