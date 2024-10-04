import React, { useRef, useState } from "react";
import Header from "./Header";
import InputSection from "./InputSection";
import NetworkSection from "./NetworkSection";
import ChatSection from "./ChatSection";
import { DataSet, Network } from "vis-network/standalone";

const MainContainer = () => {
	const [topicTitle, setTopicTitle] = useState("Selected Topic");
	const networkRef = useRef<HTMLDivElement>(null);
	const [network, setNetwork] = useState<Network | null>(null);
	const [messages, setMessages] = useState<{ role: string; content: any }[]>([]);
	const [userInput, setUserInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const nodes = useRef(new DataSet<any>([]));
	const edges = useRef(new DataSet<any>([]));
	const chatContainerRef = useRef<HTMLDivElement>(null);

	const fetchSubtopics = async (topicChain: string) => {
		const res = await fetch("/api/subtopic", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ topicChain }),
		});
		const data = await res.json();
		return data;
	};

	const fetchRoadmap = async (topic: string) => {
		const res = await fetch("/api/roadmap", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ topic: topic }),
		});
		const data = await res.json();
		return data;
	};

	const generateGraph = async (mainTopic: string) => {
		nodes.current.clear();
		edges.current.clear();

		const { roadmap, information } = await fetchRoadmap(mainTopic);
		const mainNodeId = 1;
		const mainNode = {
			id: mainNodeId,
			label: mainTopic,
			level: 0,
			color: { background: "#ffcc00", border: "#ffaa00", highlight: "#ff8800" },
			font: { color: "#000", size: 18 },
			chain: [mainTopic],
			metadata: {
				messages: [{ role: "assistant", content: information }],
				inRoadmap: true,
			},
		};
		nodes.current.add(mainNode);

		setMessages([{ role: "assistant", content: information }]);
		setTopicTitle(mainTopic);

		if (roadmap.length > 0) {
			let level = 1;
			let prevNode = mainNode;
			roadmap.forEach((subtopic: any, index: number) => {
				const newNodeId = index + 2;
				nodes.current.add({
					id: newNodeId,
					label: subtopic,
					level: level++,
					color: { background: "#cc99ff", border: "#9966ff", highlight: "#6633ff" },
					font: { color: "#000", size: 16 },
					chain: [...mainNode.chain, subtopic],
					metadata: {
						messages: [{ role: "assistant", content: information }],
						inRoadmap: true,
					},
				});
				edges.current.add({ from: prevNode.id, to: newNodeId });
				prevNode = nodes.current.get(newNodeId);
			});
		}

		const container = networkRef.current;

		if (container) {
			const data = { nodes: nodes.current, edges: edges.current };

			const options = {
				layout: {
					hierarchical: {
						direction: "UD",
						sortMethod: "directed",
						levelSeparation: 150,
						nodeSpacing: 250,
					},
				},
				physics: { enabled: false },
				interaction: { dragNodes: true, zoomView: true },
				nodes: {
					shape: "box",
					size: 20,
					font: { size: 12, color: "#ffffff", multi: true },
					borderWidth: 2,
					shadow: true,
					labelHighlightBold: true,
					shapeProperties: { useBorderWithImage: true, borderDashes: [0, 0], borderRadius: 5 },
				},
				edges: {
					width: 2,
					shadow: true,
					arrows: { to: true },
					color: { color: "#848484", highlight: "#ff6347", hover: "#848484" },
					smooth: { enabled: true, type: "cubicBezier", roundness: 0.1 },
					arrowStrikethrough: false,
				},
			};

			const newNetwork = new Network(container, data, options);

			newNetwork.on("click", async function (params) {
				if (params.nodes.length > 0) {
					const nodeId = params.nodes[0];
					const clickedNode: any = nodes.current.get(nodeId);

					// Check if the node is a leaf node (i.e., it has no children)
					const isLeafNode = !edges.current.get({ filter: (edge: any) => edge.from === nodeId }).length;

					if (isLeafNode || clickedNode.metadata.inRoadmap) {
						const { subtopics, information } = await fetchSubtopics(clickedNode.chain.slice(-5).join(" -> "));

						setTopicTitle(clickedNode.label);
						setMessages([{ role: "assistant", content: information }]);
						clickedNode.metadata.messages = [{ role: "assistant", content: information }];
						nodes.current.update(clickedNode);

						if (subtopics.length > 0) {
							subtopics.forEach((subtopic: any) => {
								const newNodeId = nodes.current.length + 1;

								if (!nodes.current.get({ filter: (item: any) => item.label === subtopic }).length) {
									nodes.current.add({
										id: newNodeId,
										label: subtopic,
										level: clickedNode.level + 1,
										color: { background: "#99ccff", border: "#6699ff", highlight: "#3377ff" },
										font: { color: "#000", size: 16 },
										chain: [...clickedNode.chain, subtopic],
										metadata: {
											messages: [],
										},
									});
									edges.current.add({ from: nodeId, to: newNodeId });
								}
							});
						} else {
							nodes.current.update({
								id: nodeId,
								color: { background: "#66ff66", border: "#33cc33", highlight: "#00ff00" },
							});
						}
					} else {
						// If the node is not a leaf, just update the topic title and messages
						setTopicTitle(clickedNode.label);
						if (clickedNode.metadata) {
							setMessages(clickedNode.metadata.messages);
						}
					}
				}
			});

			newNetwork.on("doubleClick", function (params) {
				if (params.nodes.length > 0) {
					const nodeId = params.nodes[0];
					toggleSubtreeVisibility(nodeId);
				}
			});

			setNetwork(newNetwork);
		}
	};

	const handleGenerateGraph = async () => {
		const mainTopic = (document.getElementById("main-topic") as HTMLInputElement).value;
		if (mainTopic.trim() !== "") {
			setIsLoading(true);
			await generateGraph(mainTopic);
			setIsLoading(false);
		} else {
			alert("Please enter a main topic.");
		}
	};

	const handleSendMessage = async () => {
		if (userInput.trim() === "") return;

		setIsSending(true);
		const newMessages = [...messages, { role: "user", content: userInput }];
		setMessages(newMessages);
		setUserInput("");

		const response = await fetch("/api/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ messages: newMessages }),
		});
		const result = await response.json();

		if (result) {
			setMessages([...newMessages, { role: "assistant", content: result }]);
		}

		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
		}

		// Update the metadata of the current node with the new messages
		const selectedNodes = network ? network.getSelectedNodes() : [];
		const currentNode = nodes.current.get(selectedNodes.length > 0 ? selectedNodes[0] : 1);
		if (currentNode) {
			currentNode.metadata.messages = [...newMessages, { role: "assistant", content: result }];
			nodes.current.update(currentNode);
		}
		setIsSending(false);
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>, callback: () => void) => {
		if (event.key === "Enter") {
			callback();
		}
	};

	const toggleSubtreeVisibility = (nodeId: number) => {
		const node = nodes.current.get(nodeId);
		if (!node) return;

		nodes.current.update({ id: nodeId, color: { background: "yellow", border: "yellow" } });

		const stack = [nodeId];
		const isHidden =
			edges.current.get({
				filter: (edge: any) => edge.from === nodeId,
			})[0]?.hidden || false;

		while (stack.length > 0) {
			const currentNodeId = stack.pop();
			const connectedEdges = edges.current.get({
				filter: (edge: any) => edge.from === currentNodeId,
			});

			connectedEdges.forEach((edge: any) => {
				const childNode: any = nodes.current.get(edge.to);
				edges.current.update({ id: edge.id, hidden: !isHidden });
				if (childNode) {
					nodes.current.update({
						id: childNode.id,
						hidden: !isHidden,
					});
					stack.push(childNode.id);
				}
			});
		}
	};

	return (
		<div className="container mx-auto p-4">
			<Header />
			<InputSection isLoading={isLoading} handleKeyPress={handleKeyPress} handleGenerateGraph={handleGenerateGraph} />
			<div className="flex flex-col lg:flex-row min-h-full">
				<NetworkSection networkRef={networkRef} />
				<ChatSection
					topicTitle={topicTitle}
					messages={messages}
					userInput={userInput}
					setUserInput={setUserInput}
					handleKeyPress={handleKeyPress}
					handleSendMessage={handleSendMessage}
					isSending={isSending}
					chatContainerRef={chatContainerRef}
				/>
			</div>
		</div>
	);
};

export default MainContainer;
