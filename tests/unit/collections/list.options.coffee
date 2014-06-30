setup = require '../setup'

ListOptions = require "../#{basePath}collections/list.options"

models = [
  visible: true
  name: 'Jaap'
  count: 1
  total: 1
  checked: true
,
  visible: false
  name: 'Tine'
  count: 64
  total: 64
  checked: false
,
  visible: true
  name: 'Mieke'
  count: 0
  total: 90
  checked: true
,
  visible: true
  name: 'Hein'
  count: 0
  total: 100
  checked: false
,
  visible: false
  name: 'Bert'
  count: 61
  total: 61
  checked: true
,
  visible: true
  name: 'Marieke'
  count: 38
  total: 38
  checked: false
,
  visible: true
  name: 'Gijs'
  count: 34
  total: 34
  checked: true
,
  visible: false
  name: 'Ed'
  count: 72
  total: 72
  checked: false
]

describe 'Collection ListOptions', ->
  listOptions = null

  beforeEach ->
    listOptions = new ListOptions models

  describe 'initialize', ->
    it 'should be ordered by count descending, visibles first', ->
      listOptions.pluck('name').should.eql ['Marieke', 'Gijs', 'Jaap', 'Hein', 'Mieke', 'Ed', 'Tine', 'Bert']

  describe 'orderBy', ->
    it 'should order alphabetically ascending, visibles first', ->
      listOptions.orderBy 'alpha_asc'
      listOptions.pluck('name').should.eql ['Gijs', 'Jaap', 'Marieke', 'Hein', 'Mieke', 'Bert', 'Ed', 'Tine']

    it 'should order alphabetically descending, visibles first', ->
      listOptions.orderBy 'alpha_desc'
      listOptions.pluck('name').should.eql ['Marieke', 'Jaap', 'Gijs', 'Mieke', 'Hein', 'Tine', 'Ed', 'Bert']

    it 'should order count ascending, visibles first', ->
      listOptions.orderBy 'amount_asc'
      listOptions.pluck('name').should.eql ['Jaap', 'Gijs', 'Marieke', 'Mieke', 'Hein', 'Bert', 'Tine', 'Ed']

  describe 'revert', ->
    it 'should set all options checked attribute to false', ->
      listOptions.where(checked: false).length.should.equal 4
      listOptions.revert()
      listOptions.where(checked: false).length.should.equal 8

  describe 'updateOptions', ->
    it 'should set all counts to 0 and update counts of existing models', ->
      listOptions.where(count: 72).length.should.equal 1

      newOptions = [
        name: 'Gijs'
        count: 72
      ,
        name: 'Marieke'
        count: 72
      ]

      listOptions.updateOptions newOptions

      # Gijs and Marieke should be updated to count 72
      listOptions.where(count: 72).length.should.equal 2

      # Ed should be reverted to count 0
      listOptions.findWhere(name: 'Ed').get('count').should.equal 0

    it 'should add a model when it does not exists', ->
      newOptions = [
        name: 'Marianne'
        count: 71
      ]

      listOptions.updateOptions newOptions
      listOptions.length.should.equal 9


    it 'should set all counts to 0', ->
      listOptions.where(count: 72).length.should.equal 1
      listOptions.updateOptions()
      listOptions.where(count: 0).length.should.equal 8

  describe 'setAllVisible', ->
    it 'should set all options attribute visible to true', ->
      listOptions.where(visible: true).length.should.equal 5
      listOptions.setAllVisible()
      listOptions.where(visible: true).length.should.equal 8