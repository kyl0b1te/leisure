# leisure

Zero dependency static website generator

## Why do we need another static website generation package

Well basically the idea behind `leisure` is very simple; I just want to have a reliable, fast static content website generator which in not depends on whole npm.

## How to use it

You can use `leisure` as a CLI app and directly from code.
Currently we support only [.ejs](https://github.com/mde/ejs) templates but it could be easily extended _(check [render templates](https://github.com/zhikiri/leisure/blob/master/src/build/render.js#L18) for details)_.

To start a new project you need to go through following steps:

- create a new project `npm init`
  
  Simply initialize the new node.js package

- add `.ejs` template support `npm install ejs`

  Template engines are separate dependencies and should be installed manually. It was with customizability in mind, 'cause you will pull only package required by your project.

- add `leisure` as a project dependency `npm install leisure`

  Installs generator and make `leisure` command available for use.

- create a templates for website pages 

  Create a new folder which will contain all website page templates (you can use [this](https://github.com/zhikiri/leisure/tree/master/example/basic) as example). Templates folder should contain the `/pages` subfolder, `leisure` which should contains website page templates.

- When you ready to build your website type `leisure build /tmp/website -w www.example.com`

  This command will render templates and generate html files along with website sitemap in folder with name `build`. If you want to copy additional content (ex. css or js files) you can pass it with `-c` flag, like this: 
  
  `leisure build /tmp/website -w www.example.com -c /tmp/website/css -c /tmp/website/js`.

## Customization

Website build results can be customizable with command line flags:

- `-w` your website domain name (it will be used in sitemap urls)
- `-o` path to the website static content, `leisure` will put html files in this folder _(it will create `build` folder by default)_
- `-c` path to the static content that should be required in a website build _(could be used multiple times))