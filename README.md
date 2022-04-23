# Capstone_22

Created by- Maria Gallivan, Dawson Kanehl, Zoe Norden, Connor Snow <br />
CSCI 483 <br />
Apr 20 2022 <br />


# Table of Contents
1. [Repo set up and clone](#1)
2. [Install packages](#2)
3. [Launching the app](#3)
4. [Using the app](#4)
5. [Making a tree](#5)
6. [Save tree](#6)
7. [Load tree](#7)
8. [Special notes](#8)


## Step 1-Repo set up and clone] <a name="1"></a>

Create a folder somewhere that you want to save the GitHub project to, after this in the terminal navigate to said folder and pull the code from github with the command<br /> `git clone https://github.com/MGallivan00/Capstone_22.git`.


## Step 2- Install packages <a name="2"></a>

cd in to the react app folder with in the project with the command `cd react-app`, then run the command `npm install` to install all required packages.

## Step 3- Launching the app <a name="3"></a>

Now that the required packages have been installed you can launch the app, to do so while in the react-app directory run the command `npm run start`, this will launch the app through your web browser using local host 3000.

## Step 4- Using the app <a name="4"></a>

Navigate to your web browser and you should see a blue home page with a menu in the top right and a drag me node in the bottom left. This is seen in the image below.

![background](/images/background.png)

From here you can navigate to the menu and load presets, save your tree or upload an existing tree that you have created previously. The menu is pictured below.

![menu](/images/menu.png)

## Step 5- Making a tree <a name="5"></a>

You can now drag and drop the node that says drag me in the bottom left to any where on the screen. Once the node is dropped onto the screen the bottom popup is displayed for the user to enter their desired information.

![Tree](/images/nodeDragNdrop.png)

Users can populate the screen with as many nodes as they wish for the tree. Users will also need to connect the nodes to their parent to do this the user will click on the parent node and then click add connections at the top then select its children. Pictured below is this process.

![connect](/images/connect.png)

## Step 6- Save Tree <a name="6"></a>

Now that a tree has been created the user can save it to local storage in the users download folder and to the database. this is done by selecting menu and clicking on save, no need to fill in the file extension the program makes it a legible JSON.


## Step 7- Load Tree <a name="7"></a>

The user will need to move the JSON from their download folder to the "user_uploads" folder within the src folder of the project. Once the JSON is in the "user_uploads" folder they can select upload. the user will be promoted to enter the file name, if it matches then the file is loaded.




## Special notes <a name="8"></a>

currently the Google firebase is linked to a personal account, in order to view the data base the host of the database needs to invite each user. In its current form the database is backup storage. In an actual deployment a new firebase will need to made or comment out the lines associated with the database if its scrapped. to implement a new firebase the user would just need to make a project through google and then replace the `const firebaseConfig` with the apr.jsx


Ensure your rules in storage are as follows:

`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if
          request.time < timestamp.date(2022, 12, 31);
    }
  }
}`
