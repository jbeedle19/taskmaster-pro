var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// Listens for <p> to be clicked and allows for editing
$(".list-group").on("click", "p", function() {
  var text = $(this)
    .text()
    .trim();
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);
    textInput.trigger("focus");
});

// Listens for user to click out of editing task text area
$(".list-group").on("blur", "textarea", function() {
  // Get the textarea's current value/text
  var text = $(this)
    .val()
    .trim();

  // Get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  
  // Get teh task's postition in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].text = text;
  saveTasks();

  // Recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // Replace textarea with p element
  $(this).replaceWith(taskP)
});

// Due date was clicked
$(".list-group").on("click", "span", function() {
  // Get current text
  var date = $(this).text().trim();

  // Create new input element
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);

  // Swap out elements
  $(this).replaceWith(dateInput);

  // Enable JQuery UI datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // When calendar is closed, force a "change" event on the 'dateInput'
      $(this).trigger("change");
    }
  });

  // Automatically focus on new element
  dateInput.trigger("focus");
});

// Value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
  // Get current text
  var date = $(this)
    .val()
    .trim();

  // Get parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // Get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // Update task in array an re-save to localStorage
  tasks[status][index].date = date;
  saveTasks();

  // Recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // Replace input with span element
  $(this).replaceWith(taskSpan);
});

// Allows <li>s to be dragged and sorted in <ul>s
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  /* activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  }, */
  update: function(event) {
    // Array to store the task data in
    var tempArr = [];

    // Loop over current set of children in sortable list
    $(this).children().each(function(){
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      // Add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      
      });
    });
      // Trim down list's ID to match object property
        var arrName = $(this)
        .attr("id")
        .replace("list-", "");

      // Update array on tasks object and save
        tasks[arrName] = tempArr;
        saveTasks();
  }
});

// Allows tasks to be dropped into trash area and deleted
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
  }
  /* over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  } */
});

// Add date picker to the modal's date field
$("#modalDueDate").datepicker({
  minDate: 1
});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


