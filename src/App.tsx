import './App.css';
import 'codemirror/lib/codemirror.css';
import { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import ForceGraph2D, {NodeObject, LinkObject} from 'react-force-graph-2d';
import {Controlled as CodeMirror} from 'react-codemirror2'
require('codemirror/mode/markdown/markdown');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/edit/matchbrackets');

// The size of a node should be the value of all the links pointing to it
// Maybe just store graph data for links as strings not links to objects

type Node = NodeObject & {
  name?: string,
  val?: number,
  data?: string,
  type?: string
}

type Graph = {
  nodes: Node[],
  links: LinkObject[]
}

const node1 : Node = {
  "id": "polaris",
  "name": "polaris",
  "val": 1,
  "data": "[[tom]]",
  "type": "team"
}

const node2 : Node = {
  "id": "tom",
  "name": "tom",
  "val": 1,
  "type": "person"
}

const link1 : LinkObject = {
  "source": node1.id,
  "target": node2.id
}

const myData = {
    "nodes": [node1, node2],
    "links": [link1]
}

const storedGraph = localStorage.getItem('graph')
let graph: Graph
if(storedGraph) {
  const parsedGraph = JSON.parse( storedGraph || "");
  const links: LinkObject[] = parsedGraph.links
  const reformedLinks = links.map(l => {
    const linkSource = l.source as NodeObject
    const linkTarget = l.target as NodeObject
    return {"target": linkTarget.id || linkTarget, "source": linkSource.id || linkSource}
  })
  parsedGraph.links = reformedLinks
  graph = parsedGraph
} else {
  graph = myData
}

function App() {
  const [graphData, setGraphData] = useState(graph);
  const [currentNode, setCurrentNode] = useState(graph["nodes"][0]);
  
  useEffect(() => {
    localStorage.setItem('graph', JSON.stringify(graphData));
  }, [graphData]);

  const addNode = (graph: any, name: string) => {
    const currentNodeId = currentNode.id
    const nodeName = name
    const {nodes, links} = graph

    let newNode = {
      id: nodeName,
      name: nodeName,
      val: 1
    }

    let newLink = {
      target: name,
      source: currentNodeId
    }

    return { nodes: [...nodes, newNode], links: [...links, newLink] }
  }

  const deleteNode = (event: MouseEvent<HTMLButtonElement>) => {
    const {nodes, links} = graphData
    const nodeId = event.currentTarget.name
    const nodeIdx = getNodeIdxByID(nodeId)
    const node = getNodeByID(nodeId)
    const newLinks = links.filter(l => l.source !== node && l.target !== node); // Remove links attached to node
    const newNodes = nodes.slice();
    newNodes.splice(nodeIdx, 1);

    setGraphData({ nodes: newNodes, links: newLinks });
    setCurrentNode(newNodes[0])
  }

  const getNodeByID = (nodeID: string) => {
    return graphData["nodes"].find(el => el.id === nodeID)
  }

  const getNodeIdxByID = (nodeID: string) => {
    return graphData["nodes"].findIndex(el => el.id === nodeID)
  }

  const updateNode = (nodeId: string, value: string, type: "data" | "type") => {
    const {nodes, links} = graphData
    let newNodes = nodes.slice();
    let oldNodeData = (currentNode.data || "").slice()

    const targetNodeIdx = newNodes.findIndex(el => el.id === nodeId)
    const targetNode = newNodes[targetNodeIdx]
    newNodes.splice(targetNodeIdx, 1)
    targetNode[type] = value
    setGraphData({ nodes: [...newNodes, targetNode], links: links});

    if (type === "data") {
      addLinkedNodes(value, oldNodeData)
    }
  }

  const addLinkedNodes = (value: string, oldNodeData: string) => {
    const {nodes, links} = graphData
    let graph = {nodes: nodes.slice(), links: links.slice()}
    const re = /\[\[(.*?)\]\]/g
    // We would have to change a compiler option to ignore a warning and CBA
    // @ts-ignore
    const newMatches = [...value.matchAll(re)]
    // @ts-ignore
    const oldMatches = [...oldNodeData.matchAll(re)]
    const linkNames = newMatches.map(match => match[1])
    const oldLinkNames = oldMatches.map(match => match[1])

    let deadLinks = oldLinkNames.filter(x => !linkNames.includes(x));
    linkNames.forEach(name => {
      const targetNode = graph.nodes.find(el => el.id === name)
      if (targetNode === undefined) {
        graph = addNode(graph, name)
      } else {
        const existingLink = findLink(graph, currentNode, targetNode)
        if (!existingLink) {
          graph = addLink(graph, currentNode, name)
        }
      }
    })
    // Pass through graph data rather than updating lots of times
    graph = cleanDeadLinks(graph, deadLinks)
    graph = cleanDeadNodes(graph, deadLinks)
    setGraphData(graph)
  }

  const findLink = (graph: any, source: Node | string, target: Node | string) => {
    const links: LinkObject[] = graph.links
    return links.find(l => {
      const linkSource = l.source as NodeObject
      const linkTarget = l.target as NodeObject
      return linkSource === source && linkTarget === target
    })
  }
  const addLink = (graph: any, source: Node | string, target: Node | string) => {
    const {links} = graph

    let newLink = {
      target: target,
      source: source
    }

    return { nodes: graph.nodes, links: [...links, newLink]}
  }

  const cleanDeadNodes = (graph: any, matches: any) => {
    let nodes: Node[] = graph.nodes
    const newNodes = nodes.filter(n => {
      if (matches.includes(n.id)) {
        return false
      } else {
        return true
      }
    }); // Remove links attached to node

    return {nodes: newNodes, links: graph.links}
  }

  const cleanDeadLinks = (graph: any, matches: any) => {
    let links: LinkObject[] = graph.links
    const newLinks = links.filter(l => {
      const source = l.source as Node
      const target = l.target as Node
      if (source.id === currentNode.id && matches.includes(target.id)) {
        return false
      } else {
        return true
      }
    }); // Remove links attached to node

    return {nodes: graph.nodes, links: newLinks}
  }

  const setNode = (node: Node) => {
    setCurrentNode(node)
  }

  const handleTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const nodeId = event.target.name;
    updateNode(nodeId, value, "type")
  }

  const handleCodeBeforeChange = (_editor: any, _data: any, value: any) => {
    updateNode(currentNode.id as string, value, "data")
  }

  return (
    <div className="container">
    {console.log(graphData)}
      <ForceGraph2D
        graphData={graphData}
        onNodeClick={setNode}
        nodeAutoColorBy="type"
        />
      <div className="overlay">
        <h2>{String(currentNode.id)}</h2>
        <CodeMirror
          value={currentNode.data || ""}
          options={{
            mode: 'markdown',
            matchBrakets: true,
            autoCloseBrackets: true,
          }}
          onBeforeChange={handleCodeBeforeChange}
        />
        <input name={String(currentNode.id)} onChange={handleTypeChange} value={currentNode.type || ""}/>
        <button name={String(currentNode.id)} onClick={deleteNode}>
          deleteNode
        </button>
      </div>
    </div>
  );
}

export default App;
