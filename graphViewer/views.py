from django.shortcuts import render
import urllib.request
import json
import copy
import sys



#-*- coding: utf-8 -*-




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
	titleName = titleName.replace(' ', '%20')
	titleName = titleName.replace("\u2013", '-')
	srcLink = 'https://en.wikipedia.org/w/api.php?action=query&titles=%s&prop=links&pllimit=max&format=json' % titleName
	pageJSON = None
	with urllib.request.urlopen(srcLink) as response:
   		pageJSON = response.read().decode('utf-8')
	pageDict = json.loads(pageJSON)
	return pageDict


def createDictForNode(pageDict):
	pageIDD, info = pageDict['query']['pages'].popitem()
	title = info['title']
	linksRawList = info['links']
	linkList = []
	for rawLink in linksRawList:
		linkList.append(rawLink['title'])
		# uprint(link['title'])
	# uprint(str(pageDict))
	node = createNode(title, 'foo', linkList)
	return node


def index(request):
	# graphData = json.dumps(getTestGraph())
	# return render(request, 'graphViewer/index.html', { 'graphData': graphData })
	currLvl = 0
	maxLvl = 3
	workStack = []
	nodeList = []
	pageDict = getPageData('Sachin_Tendulkar')
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
				print('CONNECTION----------->')
				uprint(nbNode)
			workStack.remove(nbID)
		except:
			pass
	# uprint(nodeA)
	# uprint(nodeB)
	graphData = json.dumps(nodeList)
	return render(request, 'graphViewer/index.html', { 'graphData': graphData })


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
