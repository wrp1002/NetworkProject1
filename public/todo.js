/********************************
*	Name:		Wesley Paglia	*
*	Student ID:	300516239		*
*********************************/

var updateCount = -1;

//	Looks through data to see if there were any changes made and updates lists accordingly
function HandleChangeList(data) {
	let current = $("#todo-list").children();
	current = $.merge(current, $("#completed-list").children());

	for (let i = 0; i < current.length; i++) {
		let id = current[i].querySelector('.id').innerText;
		let found = false;
		let tmp = $(current[i]);

		for (let j = 0; j < data.length; j++) {
			if (data[j].id == id) {
				
				if (current[i].parentElement.getAttribute('id') == "todo-list" && data[j].done) {
					$(current[i]).slideUp(250, function() {
						$(current[i]).detach();
						$('#completed-list').prepend($(current[i]));
						$(current[i]).slideDown(250);
					});
				}

				else if (current[i].parentElement.getAttribute('id') == "completed-list" && !data[j].done) {
					$(current[i]).slideUp(250, function() {
						$(current[i]).detach();
						$('#todo-list').prepend($(current[i]));
						$(current[i]).slideDown(250);
					});
				}
				else if (current[i].querySelector('.task').innerText != data[j].task || current[i].querySelector('.username').innerText != data[j].username) {
					current[i].querySelector('.task').innerText = data[j].task;
					current[i].querySelector('.username').innerText = data[j].username;
					$(current[i]).effect('highlight',1000);
				}

				break;
			}
		}
	}

}

//	Looks through data to see if there are any missing values, meaning that they should be deleted from the list
function HandleDeleteList(data) {
	deleteList = [];

	let current = $("#todo-list").children();
	current = $.merge(current, $("#completed-list").children());

	for (let i = 0; i < current.length; i++) {
		let id = current[i].querySelector('.id').innerText;
		let found = false;

		for (let j = 0; j < data.length; j++) {
			if (data[j].id == id) {
				found = true;
				break;
			}
		}

		if (!found) {
			deleteList.push(current[i]);
		}
	}

	for (let i = 0; i < deleteList.length; i++) {
		$(deleteList[i]).effect('puff', function() { 
			deleteList[i].remove();
		});
	}
}

//	Looks through new data to see if there are any new items to add to the todo list
function HandleAddList(data) {
	addList = [];

	let current = $("#todo-list").children().toArray();
	current = current.concat($("#completed-list").children().toArray());

	for (let i = 0; i < data.length; i++) {
		let found = false;
		for (let j = 0; j < current.length; j++) {
			let currentID = current[j].querySelector('.id').innerText;

			if (currentID == data[i].id) {
				found = true;
				break;
			}
		}

		if (!found)
			addList.push(data[i]);

	}

	for (let i = 0; i < addList.length; i++) {
		var taskHTML = 	'<li><span class="done">%</span>';
		taskHTML += 	'<span class="delete">x</span>';
		taskHTML += 	'<span class="edit">r</span>';
		taskHTML += 	'<span class="id" style="display:none;"></span>';
		taskHTML += 	'<span class="task"></span>';
		taskHTML += 	'<span class="username"></span></li>';

		var $newTask = $(taskHTML);
		$newTask.find('.task').text(addList[i].task);
		$newTask.find('.username').text(addList[i].username);
		$newTask.find('.id').text(addList[i].id);

		$newTask.hide();
		if (addList[i].done)
			$('#completed-list').append($newTask);
		else
			$('#todo-list').append($newTask);
		$newTask.show('clip',250).effect('highlight',1000);
	}
}


//	Used to update todo list and complete list
function UpdateLists() {
	$.ajax({
		type: "POST",
		url: "/request",
		data: JSON.stringify({request: "todo-list"}),
		contentType: "application/json; charset=utf-8",
		//success: function(data){ console.log(data); },
		failure: function(errMsg) { console.log(errMsg); }
	}).then(function(data) {
		HandleAddList(data);
		HandleDeleteList(data);
		HandleChangeList(data);

	});
	
}

//	Checks with server to see if there are any new updates
function CheckUpdates() {
	$.ajax({
		type: "POST",
		url: "/updateCount",
		data: JSON.stringify({request: "completed-list"}),
		contentType: "application/json; charset=utf-8",
		failure: function(errMsg) { console.log(errMsg); },
		success: function(data) {
			if (updateCount == -1) {
				updateCount = data.count;
			}
			else if (data.count > updateCount) {
				updateCount = data.count;
				UpdateLists();
			}
		}
	});
}


$(document).ready(function(e) {

	setInterval(CheckUpdates, 500);	// Check for updates every half a second

	$('#add-todo').button({
		icons: { primary: "ui-icon-circle-plus" }}).click(
		function() {
		$('#new-todo').dialog('open');
	});


	$('#new-todo').dialog({
		modal : true, autoOpen : false,
		buttons : {
			"Add task" : function () {
				var taskName = $('#task').val();
				var userName = $('#username').val();

				if (taskName === '' || userName === '') { return false; }

				$.ajax({
					type: "POST",
					url: "/add",
					data: JSON.stringify({task: taskName, username: userName, done: false}),
					contentType: "application/json; charset=utf-8",
					//success: function(data){ console.log(data); },
					failure: function(errMsg) { alert(errMsg); }
				}).then(function(data) {
					//$("#todo-list").html(data);
				});

				$("#task").val("");
				$("#username").val("");
				$(this).dialog('close');
			},
			"Cancel" : function () { 
				$("#task").val("");
				$("#username").val("");
				$(this).dialog('close');
			}
		}
	});

	$('#edit-todo').dialog({
		modal : true, autoOpen : false,
		buttons : {
			"Confirm" : function () {
				var task = $(this).data('item').parent('li');
				var taskName = $('#taskEdit').val();
				var userName = $('#usernameEdit').val();
				var id = task.find('.id').text();
				done = (task.parent('ul').attr('id') == 'completed-list');

				if (taskName === '' || userName === '') { return false; }

				//task.find('.task').text(taskName);
				//task.find('.username').text(userName);

				$.ajax({
					type: "POST",
					url: "/edit",
					data: JSON.stringify({task: taskName, username: userName, done: 0, id: id}),
					contentType: "application/json; charset=utf-8",
					//success: function(data){ console.log(data); },
					failure: function(errMsg) { console.log(errMsg); }
				});

				$(this).dialog('close');
			},
			"Cancel" : function () { 
				$(this).dialog('close');
			}
		}
	});

	$('#delete-todo').dialog({
		modal : true, autoOpen : false,
		buttons : {
		"Confirm" : function () {
			let task = $(this).data('item').parent('li');
			let id = task.find('.id').text();
			let done = (task.parent('ul').attr('id') == 'completed-list');

			$.ajax({
				type: "POST",
				url: "/delete",
				data: JSON.stringify({done: done, id: id}),
				contentType: "application/json; charset=utf-8",
				//success: function(data){ console.log(data); },
				failure: function(errMsg) { console.log(errMsg); }
			});

			$(this).dialog('close');
		},
		"No" : function () { $(this).dialog('close'); }
		}
	});

	$('#todo-list').on('click', '.done', function() {
		var $taskItem = $(this).parent('li');
		var task = $taskItem.find('.task').text();
		var username = $taskItem.find('.username').text();
		var id = $taskItem.find('.id').text();

		$.ajax({
			type: "POST",
			url: "/edit",
			data: JSON.stringify({task: task, username: username, done: 1, id: id}),
			contentType: "application/json; charset=utf-8",
			//success: function(data){ console.log(data); },
			failure: function(errMsg) { console.log(errMsg); }
		});
	});

	$('.sortlist').on('click','.delete',function() {
		$('#delete-todo').data('item', $(this)).dialog('open');
	});

	$('.sortlist').on('click','.edit',function() {
		var prevTask = $(this).parent('li').find('.task').text();
		var prevName = $(this).parent('li').find('.username').text();

		$('#taskEdit').val(prevTask);
		$('#usernameEdit').val(prevName);

		$('#edit-todo').data('item', $(this)).dialog('open');
	});


	$('.sortlist').sortable({
		connectWith : '.sortlist',
		cursor : 'pointer',
		placeholder : 'ui-state-highlight',
		cancel : '.delete,.done,.edit',
		update: function( event, ui ) {
			let tmp = $(ui.item)
			let id = tmp.find('.id').text();
			let task = tmp.find('.task').text();
			let username = tmp.find('.username').text();
			let done = (tmp.parent('ul').attr('id') == 'completed-list') ? 1 : 0;

			$.ajax({
				type: "POST",
				url: "/edit",
				data: JSON.stringify({task: task, username: username, done: done, id: id}),
				contentType: "application/json; charset=utf-8",
				//success: function(data){ console.log(data); },
				failure: function(errMsg) { console.log(errMsg); }
			});

		}
	});

}); // end ready