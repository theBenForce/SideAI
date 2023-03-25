import * as vscode from 'vscode';

// Reference: https://code.visualstudio.com/api/extension-guides/webview
// Example: https://github.com/microsoft/vscode-extension-samples/blob/main/webview-view-sample/src/extension.ts

export class ChatView implements vscode.WebviewViewProvider {

  public static readonly viewType = 'sideai.chatView';

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) { }

  resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [
        this._extensionUri
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(data => {
      console.info(data);
    });
  }


  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();


    const chatViewUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'chatView.js'));
    const tailwindCssUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'tailwindcss.js'));
    const daisyUiUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'styles', 'daisyui.css'));
    const showdownUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', 'showdown', 'dist', 'showdown.min.js'));

    return `<!DOCTYPE html data-theme="cupcake">
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="${showdownUri}" nonce="${nonce}"></script>

        <link rel="stylesheet" href="${daisyUiUri}" nonce="${nonce}" type="text/css" />
        <script src="${tailwindCssUri}" nonce="${nonce}"></script>
				<title>Side AI</title>
			</head>
			<body>
        <div class="flex flex-col h-full v-full">
          <div class="flex flex-col grow">
            <div class="chat chat-start">
              <div class="chat-bubble">It's over Anakin, <br/>I have the high ground.</div>
            </div>
          </div>
          <div class="flex flex-row">
          </div>
        </div>

        
				<script src="${chatViewUri}" nonce="${nonce}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}