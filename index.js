var child_process = require("child_process")
var fs = require("fs")
var prompt = require("prompt-sync")()
try {
    var dirpkjsontxt = fs.readFileSync("package.json")
} catch {
    var dirpkjsontxt = `{}`
}

var dirpkjson = JSON.parse(dirpkjsontxt)
if (dirpkjson.spark) {
    var updateChoice = prompt("Detected existing Spark project. Do you want to update it? (y/n): ").toLowerCase()
    if (updateChoice === 'y') {
        console.log("Updating Spark Framework...")
        // Create backups
        if (fs.existsSync('src')) {
            fs.cpSync('src', 'src_backup', { recursive: true })
        }
        if (fs.existsSync('readme.md')) {
            fs.cpSync('readme.md', 'readme.md.backup')
        }
        
        child_process.exec("git clone https://github.com/quntem/spark temp_spark", () => {
            // Copy everything from temp_spark except src and readme
            fs.readdirSync('temp_spark').forEach(file => {
                if (file !== 'src' && file !== 'readme.md' && file !== '.git') {
                    fs.cpSync(`temp_spark/${file}`, file, { recursive: true, force: true })
                }
            })
            
            // Restore readme if it existed
            if (fs.existsSync('readme.md.backup')) {
                fs.cpSync('readme.md.backup', 'readme.md', { force: true })
                fs.rmSync('readme.md.backup')
            }
            
            // Cleanup
            fs.rmSync('temp_spark', { recursive: true, force: true })
            console.log("Update complete! Your source code in src/ and readme have been preserved.")
            console.log("A backup of your src directory is available in src_backup/")
        })
    } else {
        console.log("Update cancelled.")
    }
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
        fs.mkdirSync("spark/src")
        fs.mkdirSync("spark/src/frontend")
        fs.mkdirSync("spark/src/backend")
        fs.writeFileSync("spark/src/frontend/index.js", `var mainview = new UIDrawView(() => {
    UDNavView(() => {
        UDInnerPadding(() => {
            UDTextNode("This is a simple project created with create-spark-app")
            UDTextNode("You can find out more information about Spark and UiDraw at the link below")
            UDButton("Github", "github")
                .color("black")
                .onclick(() => {
                    window.location.assign("https://www.github.com/oscarmayreal/UIDraw")
            })
        })
    })
    .title("Welcome to Spark Framework")
})
mainview.render()`)
        fs.writeFileSync("spark/src/backend/api.js", "")
        fs.rmSync("spark/readme.md")
        fs.writeFileSync("spark/readme.md", `# Spark Framework
This is an app created with create-spark-app
## Running
To run this app, run npm run start`)
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
        console.log("Finshed")
        console.log("To run your app, run \"cd " + newname + "\" then \"npm run start\"")
    })
}

