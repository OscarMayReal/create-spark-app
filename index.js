var child_process = require("child_process")
var fs = require("fs")
var prompt = require("prompt-sync")()
try {
    var dirpkjsontxt = fs.readFileSync("package.json")
} catch {
    var dirpkjsontxt = `{"spark":{"projtype": undefined}}`
}

var dirpkjson = JSON.parse(dirpkjsontxt)
if (dirpkjson.spark) {
    console.log("Do not run create-spark-app in an existing spark app")
} else {
    var newname = prompt("Enter the name for your new project: ")
    newname = newname.toLowerCase().replace(" ", "_")
    var installdeps = prompt("Do you want to install dependencies? (y/n): ").toLowerCase()
    var initgit = prompt("Do you want to initialise a git repository? (y/n): ").toLowerCase()
    console.log("Cloning Spark Repository")
    child_process.exec("git clone https://github.com/quntem/spark", () => {
        var pkjsontxt = fs.readFileSync("spark/package.json")
        console.log("editing package.json")
        var pkjson = JSON.parse(pkjsontxt)
        pkjson.name = newname
        pkjsontxt = JSON.stringify(pkjson)
        console.log("Renaming Folder")
        fs.writeFileSync("spark/package.json", pkjsontxt)
        fs.rmSync("spark/.git", { recursive: true, force: true })
        fs.cpSync("spark", newname, {recursive: true})
        fs.rmSync("spark", { recursive: true, force: true })
        if (installdeps == "y") {
            console.log("Installing dependencies")
            child_process.exec("npm install", {cwd: "./" + newname})
        }
        if (initgit == "y") {
            console.log("initialising git repository")
            child_process.exec("git init", {cwd: "./" + newname}, () => {
                child_process.exec("git add --all", {cwd: "./" + newname})
            })
        }
    })
}

