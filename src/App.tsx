import './App.css';
import { useState, ChangeEvent, MouseEvent } from 'react';
import ForceGraph2D, {NodeObject, LinkObject} from 'react-force-graph-2d';

// The size of a node should be the value of all the links pointing to it

type Node = NodeObject & {
  name?: string,
  val?: number,
  data?: string,
  type?: string
}

const node1 : Node = {
  "id": "shadowfen",
  "name": "shadowfen",
  "val": 1,
  "data": "[[huntersbow]]",
  "type": "place"
}

const node2 : Node = {
  "id": "huntersbow",
  "name": "huntersbow",
  "val": 2,
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
function App() {
  const [graphData, setGraphData] = useState(myData);
  const [currentNode, setCurrentNode] = useState(myData["nodes"][0]);

  const addNode = (name: string) => {
    const currentNodeId = currentNode.id
    const nodeName = name
    const {nodes, links} = graphData
    const newNodes = nodes.slice();
    const newLinks = links.slice();

    let newNode = {
      id: nodeName,
      name: nodeName,
      val: 1
    }

    let newLink = {
      target: name,
      source: currentNodeId
    }

    setGraphData({ nodes: [...newNodes, newNode], links: [...newLinks, newLink] });
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
    event.preventDefault()
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
    const {nodes} = graphData
    let newNodes = nodes.slice();
    const re = /\[\[(.*?)\]\]/g
    // We would have to change a compiler option to ignore a warning and CBA
    // @ts-ignore
    const newMatches = [...value.matchAll(re)]
    // @ts-ignore
    const oldMatches = [...oldNodeData.matchAll(re)]
    const linkNames = newMatches.map(match => match[1])
    const oldLinkNames = oldMatches.map(match => match[1])

    console.log(linkNames)
    let deadLinks = oldLinkNames.filter(x => !linkNames.includes(x));
    console.log(deadLinks)
    linkNames.forEach(name => {
      const targetNode = newNodes.find(el => el.id === name)
      if (targetNode === undefined) {
        addNode(name)
      } else {
        addLink(currentNode, name)
      }
    })
    cleanDeadLinks(deadLinks)
  }

  const addLink = (source: Node | string, target: Node | string) => {
    const {links} = graphData

    let newLink = {
      target: target,
      source: source
    }

    setGraphData({ nodes: graphData.nodes, links: [...links, newLink] });
  }

  const cleanDeadLinks = (matches: any) => {
    const {links} = graphData
    const lanks = links.slice()
    const newLinks = lanks.filter(l => {
      const source = l.source as Node
      const target = l.target as Node
      if (source.id === currentNode.id && matches.includes(target.id)) {
        return false
      } else {
        return true
      }
    }); // Remove links attached to node

    console.log(newLinks)

    setGraphData({nodes: graphData.nodes, links: newLinks})
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    const nodeId = event.target.name;
    updateNode(nodeId, value, "data")
  }

  const setNode = (node: Node) => {
    setCurrentNode(node)
  }

  const handleTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const nodeId = event.target.name;
    updateNode(nodeId, value, "type")
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
        <textarea name={String(currentNode.id)} onChange={handleChange} value={currentNode.data || ""}/>
        <input name={String(currentNode.id)} onChange={handleTypeChange} value={currentNode.type || ""}/>
        <button name={String(currentNode.id)} onClick={deleteNode}>
          deleteNode
        </button>
      </div>
    </div>
  );
}

export default App;
