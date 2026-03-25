const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadURL("http://localhost:3001");
}

app.whenReady().then(() => {
  const isDev = !app.isPackaged;
  const backendPath = isDev
    ? path.join(__dirname, "../backend")
    : path.join(process.resourcesPath, "backend");

  if (isDev) {
    serverProcess = spawn("npx", ["ts-node", "src/app.ts"], {
      cwd: backendPath,
      shell: true,
    });
  } else {
    serverProcess = spawn("node", ["dist/src/app.js"], {
      cwd: backendPath,
      shell: true,
      env: { ...process.env, IS_PACKAGED: 'true' }
    });
  }

  setTimeout(createWindow, 3000);
});

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill();
  app.quit();
});

ipcMain.handle("print-receipt", async (event, saleData) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            width: 250px; /* 80mm roller */
            margin: 0;
            padding: 0;
            color: #000;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin: 6px 0; }
          th, td { padding: 2px 0; font-size: 10px; }
          .font-sm { font-size: 9px; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <h1 style="margin:0;">90's</h1>
          <h2 style="margin:0;">HipHop & Street Wear</h2>
          <div style="padding-top: 5px; font-size: 10px;">Murgiya, Lumbini gate</div>
        </div>        
        <table style="padding-top: 5px; margin: 0; width: 100%;">
          <tr>
            <td class="font-sm" align="left">TX: ${saleData.id.slice(-8)}</td>
            <td class="font-sm" align="right">Date: ${new Date().toLocaleString()}</td>
          </tr>
        </table>
        
        <div class="divider" style="margin-top: 0;"></div>
        
        <table>
          <thead>
            <tr style="border-bottom: 1px dashed #000;">
              <th align="left">Item</th>
              <th align="left">Code</th>
              <th align="center">Qty</th>
              <th align="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${saleData.items.map(i => `
              <tr>
                <td>${i.item.name}</td>
                <td>${i.item.code}</td>
                <td align="center">${i.quantity}</td>
                <td align="right">Rs.${i.quantity * i.price}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="divider"></div>
        <table>
          <tr>
            <td>Subtotal:</td>
            <td align="right">Rs.${(saleData.totalAmount + (saleData.discount || 0))}</td>
          </tr>
          <tr style="border-top: 1px solid #000;">
            <td class="bold">Total Paid:</td>
            <td class="bold" align="right">Rs.${saleData.totalAmount}</td>
          </tr>
          <tr>
            <td>Payment Mode:</td>
            <td align="right">${saleData.paymentMode}</td>
          </tr>
        </table>
        <div class="divider"></div>
        
        <div class="text-center font-sm" style="margin-top:20px;">
          <div>Thank you for your purchase!</div>
        </div>
      </body>
    </html>
  `;

  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  try {
    const printers = await printWindow.webContents.getPrintersAsync();
    const zkteco = printers.find(p => p.name.toLowerCase().includes("zkteco") || p.name.toLowerCase().includes("usb001"));

    const printOptions = {
      silent: true,
      margins: { marginType: 'none' }
    };

    if (zkteco) {
      printOptions.deviceName = zkteco.name;
    }

    return new Promise((resolve) => {
      printWindow.webContents.print(printOptions, (success, failureReason) => {
        if (success) {
          resolve({ success: true, message: "Receipt printed successfully!" });
        } else {
          console.error("Print failed:", failureReason);
          resolve({ success: false, message: `Print failed: ${failureReason}` });
        }
        setTimeout(() => printWindow.close(), 500);
      });
    });
  } catch (e) {
    console.error("Failed to print:", e);
    printWindow.close();
    return { success: false, message: `Failed to print: ${e.message}` };
  }
});
