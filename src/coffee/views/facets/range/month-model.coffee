Range = require './model'


class MonthRange extends Range

	convertLimit2Year: (limit) ->
		year = limit + ''
		year = "0" if year.length is 0

		if year.length > 6
			if year.length is 8
				year = year.substr 0, 6
			else if year.length is 7
				year = year.substr 0, 5
			else
				throw new Error "Range: lower or upper limit is not 0, 1, 2, 3, 4, 7 or 8 chars!"

		+year

	_convertYear2Limit: (year, from=true) ->
		limit = year + ''
		limit += if from then "01" else "31"
		+limit

	getLowerLimit: ->
		unit = @get('currentMin')
		monthPart = "" + (parseInt((parseInt(("" + unit).substr(4,2)) / 100) * 12) + 1)
		if(monthPart.length == 1)
			monthPart = "0" + monthPart
		parseInt(("" + unit).substr(0,4) + monthPart + "31")
	
	getUpperLimit: ->
		unit = @get('currentMax')
		monthPart = "" + (parseInt((parseInt(("" + unit).substr(4,2)) / 100) * 12) + 1)
		if(monthPart.length == 1)
			monthPart = "0" + monthPart
		parseInt(("" + unit).substr(0,4) + monthPart + "31")


	getMonthLabel: (unit, conv)->
		if conv
			monthPart = "" + (parseInt((parseInt(("" + unit).substr(4,2)) / 100) * 12) + 1)
		else
			monthPart = ("" + unit).substr(4,2)

		if(monthPart.length == 1)
			monthPart = "0" + monthPart

		("" + unit).substr(0,4) + "-" + monthPart


module.exports = MonthRange