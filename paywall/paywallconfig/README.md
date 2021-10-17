# Getting Started
First, install all dependencies in package.json

yarn install 

& 

yarn start http://localhost:3000 with your browser to see the result.

You can start editing the page by modifying src/app.js. The page auto-updates as you edit the file.

# Add to a static page

 run yarn build to produce a minified build.

Create a folder to hold the three files your application needs to run. I named mine dist. You will need these three files:
* The file holding roughly a minified version of the libraries you are using.
  ``` 
    ./build/static/js/2.<someUniqueNumbers>.chunk.js
  ```
* The file holding a minified version of your code.
  ```
  ./build/static/js/main.<someUniqueNumbers>.chunk.js
  ```
* The file holding the code to launch your application.
  ```
  ./build/static/js/runtime-main.<someUniqueNumbers>.js
  ```
 We can call our new static assets as JS files and point our React widget to mount a "div" on yout website.
 ```
  <body>
    <h1>Unlock Demo</h1>
    
    <div id="paywallConfig"></div>


    <script src="dist/2.567483bd.chunk.js"></script>
    <script src="dist/main.a9bfd85f.chunk.js"></script>
    <script src="dist/runtime-main.e1b710a3.js"></script>
  </body>
 ```
  

Sample embedded code in html: 
[test.html](https://github.com/ManyRios/unlock/blob/paywall-js/paywall/paywallconfig/test.html)


# Fill the form: 

- Select a network for your lock(Mainnet, xDai, Polygon, Rinkeby)
- Add your existing lock address
- Add a name for your lock(optional)
YOU CAN ADD MULTIPLE LOCKS IF YOU WISH
- Add a valid URL image for your icon
- Set a message for your customers 
- Add a referrer Code 
- Set the messimistic feature
- If you want to collect metadata from your customers you can add multiple of them. 


# Please visit this link for the final form 

[Paywall Config Example](https://unlock-paywall-config.vercel.app/)
