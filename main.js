const electron = require('electron');
const path = require('path');
const url = require('url');


const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

//set environment
APP_Environment = "production"

app.on('ready', function(){
	//create new window
	mainWindow = new BrowserWindow({
		webPreferences: {nodeIntegration: true},
		icon:__dirname+'/assets/icon.png'
	});

	//load html to new window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'mainwindow.html'),
		protocol: 'file:',
		slashes: true
	}));
	// quit app when closed
	mainWindow.on('closed', function(){
		app.quit();
	});
	// build menu template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

	// insert menu
	Menu.setApplicationMenu(mainMenu);
});


// creates add window to add new item
function createAddWindow(){
	addWindow = new BrowserWindow({
		width: 400,
		height: 200,
		title: 'Add new item',
		icon:__dirname+'/assets/icon.png',
		webPreferences: {nodeIntegration: true},//needed for electron 5 and above for loading basic require
	});

	//load html to new window
	addWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'addwindow.html'),
		protocol: 'file:',
		slashes: true,
	}));
	// garbage collection handle
	addWindow.on('closed', function() {
		addWindow = null;
	})
};

//catch item:add from child ipcrenderer
ipcMain.on('item:add', function(e, item){
	//console.log(item);
	//send item from add window to main window
	mainWindow.webContents.send('item:add', item);
	addWindow.close();
});
//create menu template
const mainMenuTemplate = [
	{
		label: 'File', 
		submenu: [
			{
				label: 'Add Item',
				accelerator: process.platform == 'win32' ? 'Ctrl+A' : 'Command+A',
				click(){
					createAddWindow();
				}
			},
			{
				label: 'Clear Items',
				click(){
					mainWindow.webContents.send('item:clear');
				}
			},
			{
				label: 'Quit',
				accelerator: process.platform == 'win32' ? 'Ctrl+Q' : 'Command+Q',
				click(){
					app.quit();
				}
			}
			
		]
	}
	
]


//if mac os, add empty object to menu
if(process.platform == 'darwin'){
	console.log('not windows');
	mainMenuTemplate.unshift({});
}

//add dev tolls item  if not in production
if( APP_Environment == 'dev' ){
	mainMenuTemplate.push(
		{
			label: 'Developer Tools', 
			submenu: [
				{
					label: 'Toggle DevTools',
					accelerator: process.platform == 'win32' ? 'Ctrl+I' : 'Command+I',
					click(item, focusedWindow){
						focusedWindow.toggleDevTools();
					}
				},
				{
					role: 'reload', //for reload
				}
			]
		}
    );
}