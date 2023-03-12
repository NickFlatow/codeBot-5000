// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';
import * as path from 'path';
import axios, {AxiosResponse} from 'axios';
import {API_KEY} from './config';

// import { Configuration, OpenAIApi,ChatCompletionRequestMessage,CreateChatCompletionRequest } from "openai";


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Define the API endpoint and query parameters
	const API_URL = 'https://api.openai.com/v1/chat/completions';
	const headers = {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${API_KEY}`
	};

	let chatLog:any[] = [];

	context.subscriptions.push(
		vscode.commands.registerCommand('gpt-assistant.testWindow',() => {

			vscode.window.showInputBox({
				prompt: 'Please Enter your Prompt',
				placeHolder: 'Chatbot-5000'
			}).then((value) => {
				if (value) {

					// Get the active editor
					const editor = vscode.window.activeTextEditor;
					let highlightedText:string = ''; 

					if (editor) {
						// Get all highlighted ranges in the editor
						const highlightedRanges = editor.selections.filter((selection) => !selection.isEmpty);

						// Get the text for each range
						highlightedRanges.forEach((range) => {
							highlightedText = editor.document.getText(range);
							console.log(highlightedText);
						});
					}
					chatLog.push({ role: 'user', content: value + " " + highlightedText });

					  const messages: any[] = [
						{ role: "system", content: "You are a coding assistance. Your purpose is to create code snippets. Only reply with code in a single code block. Do not provide any explination. If you provide an explnation put it in a coding comment"},
						// { role: 'user', content: value + " " + highlightedText }
						...chatLog
					];
					
					const chatRequestOpts: any = {
						model: 'gpt-3.5-turbo',
						messages,
						temperature: 0.9,
						// stream: true
					};
					
					// Make the POST request to the OpenAI API
					axios.post(API_URL, JSON.stringify(chatRequestOpts), {headers:headers}).then(response => {
						try {
							if (response.status !== 200) {
								console.log(response.data);
								throw new Error('Request Failed.\n' + `Status Code: ${response.status}`);
							}


							outputToEditor(response.data.choices[0].message.content);
							
							vscode.window.showInformationMessage(`Total Session Tokens ${response.data.usage.total_tokens}`);
							
							//add latest message from the assistant to the log
							chatLog = [...chatLog , {role: 'assistant',content: response.data.choices[0].message.content}];

						}catch (error:any) {
							console.error(error.message); 
							throw new Error("aaaahhh ");
						}
						// Handle the response from the API
					})
					.catch(error => {
						// Handle any errors that occur
						console.error(error);
					});
				}
			});
		})
	);

	function outputToEditor(value:string) {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const currentPosition = editor.selection.active;
			editor.edit(editBuilder => {
				editBuilder.insert(currentPosition, value);
			});
		}
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
