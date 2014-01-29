define (require) ->
	Models =
		Facet: require 'models/facet'

	class PeriodFacet extends Models.Facet
		idAttribute: 'name'

		find: (start, end) ->
			overlappingPeriods = []
			for period in @get 'periods'
				[pstart, pend] = period.name.split /\s+-\s+/ # "1910 - 1920"
				# some periods contain full dates, i.e. "1910-01-01 - 1920-01-01"
				# so we need to split on dash to get just the year
				pstart = pstart.split(/\-/)[0]
				pend = pend.split(/\-/)[0]

				beginOverlap  = (pstart <= start and pend >= start and pend <= end)    #  P---|---P----|
				endOverlap    = (pstart >= start and pstart <= end and pend >= end)    #  |----P---|---P
				totalOverlap  = (pstart <= start and pend >= end)                      #  P--|------|--P
				insideOverlap = (pstart >= start and pend <= end)                      #  |--P------P--|

				if beginOverlap or endOverlap or insideOverlap or totalOverlap
					overlappingPeriods.push period.name

			overlappingPeriods

		parse: (attrs) ->
			attrs.periods = attrs.options

			allYears = _.unique _.flatten _.map(_.pluck(attrs.options, 'name'),
				(option) -> o.split(/-/)[0] for o in option.split /\s+-\s+/)
				# can be both 2001 - 2008, as well as 2001-01-01 - 2008-01-01
			attrs.options = _.unique _.filter( _.flatten([1930, 1630, allYears]).sort(), (y) -> y >= 1630 and y <= 1930 )

			attrs