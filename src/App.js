import './App.css';
import { useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// The size of a node should be the value of all the links pointing to it

const myData = {
    "nodes": [
        {
          "id": "1",
          "name": "name1",
          "val": 1
        },
        {
          "id": "2",
          "name": "name2",
          "val": 10
        }
    ],
    "links": [
        {
            "source": "1",
            "target": "2"
        }
    ]
}
function App() {
  const [graphData, setGraphData] = useState(myData);
  const [currentNode, setCurrentNode] = useState(myData["nodes"][0]);

  const addNode = (name) => {
    const currentNodeId = currentNode.id
    const nodeName = name
    const {nodes, links} = graphData
    const newNodes = nodes.slice();
    const newLinks = links.slice();

    let newNode = {
      id: nodeName
    }

    let newLink = {
      target: name,
      source: currentNodeId
    }

    console.log(newNode)
    console.log(newLink)
    console.log(graphData)
    setGraphData({ nodes: [...newNodes, newNode], links: [...newLinks, newLink] });
  }

  const deleteNode = (event) => {
    const {nodes, links} = graphData
    const nodeId = event.target.name
    const nodeIdx = getNodeIdxByID(nodeId)
    const node = getNodeByID(nodeId)
    const newLinks = links.filter(l => l.source !== node && l.target !== node); // Remove links attached to node
    const newNodes = nodes.slice();
    newNodes.splice(nodeIdx, 1); // Remove node
    newNodes.forEach((n, idx) => { n.id = idx; }); // Reset node ids to array index

    setGraphData({ nodes: newNodes, links: newLinks });
  }

  const getNodeByID = (nodeID) => {
    return graphData["nodes"].find(el => el.id === nodeID)
  }

  const getNodeIdxByID = (nodeID) => {
    return graphData["nodes"].findIndex(el => el.id === nodeID)
  }

  const updateNode = (nodeId, value) => {
    const {nodes, links} = graphData
    let newNodes = nodes.slice();

    const targetNodeIdx = newNodes.findIndex(el => el.id === nodeId)
    const targetNode = newNodes[targetNodeIdx]
    newNodes.splice(targetNodeIdx, 1)
    targetNode["data"] = value

    setGraphData({ nodes: [...newNodes, targetNode], links: links});

    const re = /\[\[(.*?)\]\]/g
    const matches = [...value.matchAll(re)]
    matches.forEach(match => {
      const name = match[1]
      const targetNode = newNodes.find(el => el.id === name)
      if (targetNode === undefined) {
        addNode(name)
      }
    })
  }

  const handleChange = (event) => {
    const value = event.target.value;
    const nodeId = event.target.name;
    updateNode(nodeId, value)
  }

  const setNode = (node, event) => {
    setCurrentNode(node)
  }

  return (
    <div className="container">
      <ForceGraph2D
        graphData={graphData}
        onNodeClick={setNode}
      />
      <div className="overlay">
        <h2>{String(currentNode.id)}</h2>
        <textarea name={String(currentNode.id)} onChange={handleChange} value={currentNode.data || ""}/>
      <button name={currentNode.id} onClick={deleteNode}>
        deleteNode
      </button>
      </div>
    </div>
  );
}

export default App;
