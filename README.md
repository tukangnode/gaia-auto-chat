# Auto Chat Completion for Gaianet.ai

Inspired by [**WINSNIP**](https://github.com/winsnip/gaiabot-winsnip) , with thanks for **keywords.txt**.
---

## Features
- Support for **multiple nodes**
- **Proxies supported**
- Execute chat completions in **parallel**


---


## Find domains

![Find Domains](https://s3.amazonaws.com/i.snag.gy/WqJdg4.jpg)


For better throughput points, choose a domain that currently runs on 0 or 1 node.

Example:
0 node running on **qwen05b.gaia.domains** and uses the **Qwen2.5-0.5B-Instruct** model.



## Config Installation

**On your Node server:**

Install the model based on your chosen domain's model. In this tutorial, the selected model is **Qwen2.5-0.5B-Instruct**, so we need to install that model on our node. Before proceeding, ensure you have installed the Gaianet CLI.



```bash
gaianet stop
gaianet init --config https://raw.gaianet.ai/qwen2.5-0.5b-instruct/config.json
gaianet config --domain gaia.domains 
gaianet init 
gaianet start
```
If your chosen domain uses another model, modify the URL:
https://raw.gaianet.ai/<chosen-model>/config.json

If you see "The GaiaNet node is started at: https://NodeID.gaia.domains", then proceed to the join domain part.


# Join Domain
![Join Domain](https://s3.amazonaws.com/i.snag.gy/gwU7mM.jpg)

Make sure your node and domains have the same model. After you successfully join the domains, you can use the script to automate chat completions to achieve better throughput points.



## Auto Chat Completeion Usage

**On your vps** to run this script :

Clone the repository and install the dependencies:
```bash
git clone https://github.com/tukangnode/gaia-auto-chat.git
npm install
```
Use the script to automate node operations across subdomains.


To run the script for 3 subdomains:

```bash
node auto.js qwen05b prismanuel llama
```

To run the script for 1 subdomain:

```bash
node auto.js qwen05b 
```
    
![Script Screenshot](https://s3.amazonaws.com/i.snag.gy/9bFKif.jpg)


- **Sending**: Indicates the node is completing the current question.
- **Idle**: Indicates the node is waiting for the next question.
- **totalChats**: Displays the total number of completed chat requests.

You can run this script with **tmux** or **screen**