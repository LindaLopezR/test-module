import { Template } from 'meteor/templating';
import moment from 'moment';

import './test.html';

let scheduleToTest = {
	hours : {
		start : {
			hour : 6,
			minute : 0,
			raw : "06:00"
		},
		finish : {
			hour : 16,
			minute : 0,
			raw : "18:00"
		}
	},
	days : {
		start : 1,	//Lunes
		finish : 2	//Viernes
	}
};

Template.test.helpers({

	getDays() {
		return [{day:1},{day:2},{day:3},{day:4},{day:5},{day:6},{day:7}];
	},

	getHours() {
		let hours = [];
		for (let hour=0; hour<24; hour++) {
			let text = hour + ':00';
			hours.push({hour:hour, text:text});
		}
		return hours;  
	},

	getColor(hour) {
		let date = moment();
		date = date.day(this.day);
		date = date.hour(Number(hour));
		let flag = allowToReprogram(date, scheduleToTest);

		console.log(date.format('dddd HH:mm') + ' = ' + flag);

		if (flag)
			return '#01DF01';
		else
			return '#FFF';
	}

});

Template.test.events({

});

function allowToReprogram(actualDate, schedule) {

	console.log(actualDate);
	let isNormalHour = (schedule.hours.start.hour) < (schedule.hours.finish.hour);

	if (schedule.days.start < schedule.days.finish) {
		return normalCaseDay(actualDate, schedule, isNormalHour);
	} else {
		return anormalCaseDay(actualDate, schedule, isNormalHour);
	}
}

//////////////////////////////  DAY //////////////////////////////
function normalCaseDay(actualDate, schedule, isNormalHour) {

	let workingDay = true;

	if( (actualDate.weekday()) < schedule.days.start || ( actualDate.weekday()) > schedule.days.finish ){
		console.log('Cancel because is an inactive day');
		workingDay = false;
	}

	if (workingDay && isNormalHour) {
		return normalCaseHour(actualDate, schedule);
	} 

	if (!workingDay && isNormalHour) {
		return false;
	}

	return anormalCaseHour(actualDate, schedule, workingDay);
}

function anormalCaseDay(actualDate, schedule, isNormalHour) {

	let workingDay = true;

	if( ( actualDate.weekday()) < schedule.days.start && (actualDate.weekday()) > schedule.days.finish ){
		//console.log('Cancel because is an inactive day');
		workingDay = false;
	}

	if (workingDay && isNormalHour) {
		return normalCaseHour(actualDate, schedule);
	}

	if (!workingDay && isNormalHour) {
		return false;
	}

	return anormalCaseHour(actualDate, schedule, workingDay);
}

//////////////////////////////  HOUR //////////////////////////////
function normalCaseHour(actualDate, schedule) {

	let flag = true;

	let minTimeInMinutes = (schedule.hours.start.hour * 60) + schedule.hours.start.minute;
	let maxTimeInMinutes = (schedule.hours.finish.hour * 60) + schedule.hours.finish.minute;

	let currentTimeInMinutes = (actualDate.hour() * 60) + actualDate.minute();

	if(currentTimeInMinutes < minTimeInMinutes || currentTimeInMinutes > maxTimeInMinutes){
		//console.log('Cancel because is an inactive hour');
		flag = false;
	}

	return flag;
}

function anormalCaseHour(actualDate, schedule, workingDay) {

	let minTimeInMinutes = (schedule.hours.start.hour * 60) + schedule.hours.start.minute;
	let maxTimeInMinutes = (schedule.hours.finish.hour * 60) + schedule.hours.finish.minute;

	let currentTimeInMinutes = (actualDate.hour() * 60) + actualDate.minute();


	if ( workingDay ) {
	//Si trabaja

		if ( (actualDate.weekday()) == schedule.days.start) {
			return currentTimeInMinutes > minTimeInMinutes;
		} else {
			return  !( (currentTimeInMinutes > maxTimeInMinutes) && 
			(currentTimeInMinutes < minTimeInMinutes) );
		}

	} else {
	//No trabaja
		if ( (actualDate.weekday()) == (schedule.days.finish + 1) ) {
			return currentTimeInMinutes < maxTimeInMinutes;
		} else {
			return false;
		}
	}

	return false;
}
