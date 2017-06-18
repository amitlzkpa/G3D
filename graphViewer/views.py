from django.shortcuts import render
import urllib.request
import json
import copy
import sys
from django.http import HttpResponse, HttpRequest, HttpResponseRedirect, Http404, JsonResponse



#-*- coding: utf-8 -*-





def getQuery(link):
	with urllib.request.urlopen(link) as response:
   		pageJSON = response.read().decode('utf-8')
	return pageJSON


def wikiSearchMirror(request):
	keyWordText = request.GET.get('keyword', '')
	queryLink = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=%s&limit=6&namespace=0&format=json' % keyWordText
	queryResponse = getQuery(queryLink)
	returnDict = json.loads(queryResponse)
	return JsonResponse(returnDict, safe=False)


def wikiGraphData(request):
	wikiPageSrcLink = request.GET.get('wikipagetitle', '')
	linkParts = wikiPageSrcLink.split('/')
	wikiPageTitle = linkParts[-1].replace('_', ' ')
	queryResponse = getGraphDataJSON(wikiPageTitle)
	returnDict = json.loads(queryResponse)
	return JsonResponse(returnDict, safe=False)























def getTestGraph():
	testGraph = [
		{
		"nodeName": "A",
		"nodeID": 1,
		"nodeData": "fooA,gooA",
		"nodeNeighbours": [2, 3]
		},
		{
		"nodeName": "B",
		"nodeID": 2,
		"nodeData": "fooB,gooB",
		"nodeNeighbours": [1, 3]
		},
		{
		"nodeName": "C",
		"nodeID": 3,
		"nodeData": "fooC,gooC",
		"nodeNeighbours": [1, 2, 4, 5]
		},
		{
		"nodeName": "D",
		"nodeID": 4,
		"nodeData": "fooD",
		"nodeNeighbours": [3, 5, 6]
		},
		{
		"nodeName": "E",
		"nodeID": 5,
		"nodeData": "fooE,gooE",
		"nodeNeighbours": [3, 4, 7]
		},
		{
		"nodeName": "F",
		"nodeID": 6,
		"nodeData": "fooF,gooF",
		"nodeNeighbours": [4, 8]
		},
		{
		"nodeName": "G",
		"nodeID": 7,
		"nodeData": "fooG,gooG,hooG",
		"nodeNeighbours": [5, 8]
		},
		{
		"nodeName": "H",
		"nodeID": 8,
		"nodeData": "",
		"nodeNeighbours": [6, 7, 9]
		},
		{
		"nodeName": "I",
		"nodeID": 9,
		"nodeData": "fooI,gooI",
		"nodeNeighbours": [8]
		}
	]
	return testGraph





def uprint(*objects, sep=' ', end='\n', file=sys.stdout):
    enc = file.encoding
    if enc == 'UTF-8':
        print(*objects, sep=sep, end=end, file=file)
    else:
        f = lambda obj: str(obj).encode(enc, errors='backslashreplace').decode(enc)
        print(*map(f, objects), sep=sep, end=end, file=file)



def getPageData(titleName):
	linkLength = 20
	titleName = titleName.replace(' ', '%20')
	titleName = titleName.replace("\u2013", '-')
	srcLink = 'https://en.wikipedia.org/w/api.php?action=query&titles=%s&prop=links&pllimit=%s&format=json' % (titleName, linkLength)
	pageJSON = None
	with urllib.request.urlopen(srcLink) as response:
   		pageJSON = response.read().decode('utf-8')
	pageDict = json.loads(pageJSON)
	return pageDict


def makeData(srcLink):
	pageJSON = None
	with urllib.request.urlopen(srcLink) as response:
   		pageJSON = response.read().decode('utf-8')
	pageDict = json.loads(pageJSON)
	pageIDD, info = pageDict['query']['pages'].popitem()
	dataDict = {}
	txt = info['extract']
	txt = txt.replace('\n', ' ')
	txt = txt.replace('\"', '\'')
	dataDict['introText'] = txt
	dataDict['imageLink'] = "#"
	# return pageDict
	return dataDict


def getWikiLink(titleName):
	titleName = titleName.replace(' ', '%20')
	titleName = titleName.replace("\u2013", '-')
	srcLink = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=%s' % titleName
	return srcLink


def createDictForNode(pageDict):
	pageIDD, info = pageDict['query']['pages'].popitem()
	title = info['title']
	linksRawList = info['links']
	linkList = []
	for rawLink in linksRawList:
		linkList.append(rawLink['title'])
		# uprint(link['title'])
	# uprint(str(pageDict))
	srcLink = getWikiLink(title)
	data = makeData(srcLink)
	node = createNode(title, data, linkList)
	return node


def index(request):
	# tst = getTestGraph()
	# uprint(tst[0]['nodeName'])
	# uprint(len(tst[0]['nodeNeighbours']))
	# uprint(tst[0]['nodeNeighbours'])
	# graphData = json.dumps(tst)
	# return render(request, 'graphViewer/index.html', { 'graphData': graphData })
	# titleName = 'Sachin_Tendulkar'
	# graphData = getGraphDataJSON(titleName)
	return render(request, 'graphViewer/index.html', { })


def getGraphDataJSON(titleName):
	nodeListDict = getNodeListDict(titleName)
	nodeListJSON = json.dumps(nodeListDict)
	return nodeListJSON


def getNodeListDict(titleName):
	currLvl = 0
	maxLvl = 1
	workStack = []
	nodeList = []
	pageDict = getPageData(titleName)
	nodeA = createDictForNode(pageDict)
	nodeList.append(nodeA)
	workStack = copy.deepcopy(nodeA['nodeNeighbours'])
	for nbID in workStack:
		try:
			nbName = nbID.split('/')[-1]
			nbPageDict = getPageData(nbName)
			nbNode = createDictForNode(nbPageDict)
			if (nbNode not in nodeList):
				nodeList.append(nbNode)
			else:
				uprint('CONNECTION----------->')
				uprint(nbNode)
			workStack.remove(nbID)
		except:
			pass
	return nodeList


def getEmptyNode():
	nodeTemplate = {}
	nodeTemplate['nodeName'] = None
	nodeTemplate['nodeID'] = None
	nodeTemplate['nodeData'] = None
	nodeTemplate['nodeNeighbours'] = None
	return nodeTemplate


def makeWebWikiURL(name):
	return 'https://en.wikipedia.org/wiki/' + name.replace(' ', '_')


def createNode(name, data, neighboursList):
	wikiURL = makeWebWikiURL(name)
	node = getEmptyNode()
	node['nodeName'] = name
	node['nodeID'] = wikiURL
	node['nodeData'] = data
	node['nodeNeighbours'] = [makeWebWikiURL(x) for x in neighboursList]
	return node
