const express = require('express')
const ejs = require('ejs')
const qrcode = require('qrcode')
const formidable = require('formidable')
const app = express()
const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')
app.use(express.static("public"))
app.set('view engine', 'ejs')

var data = ""

async function create(dataForQRcode, center_image, width, color) {
    try {
        const canvas = createCanvas(width, width);
        qrcode.toCanvas(
            canvas,
            dataForQRcode, {
                errorCorrectionLevel: "H",
                margin: 1,
                color: {
                    dark: color,
                    light: "#ffffff",
                },
            }
        );

        const ctx = canvas.getContext("2d");
        if (center_image) {
            const img = await loadImage(center_image);
            const cwidth = 0.2 * canvas.width
            const center = (canvas.width / 2) - (cwidth / 2);
            ctx.drawImage(img, center, center, cwidth, cwidth);
        }
        
        return canvas.toDataURL("image/png");
    } catch (err) {
        console.log(err);
    }
}

app.get("/", (req, res) => {
    if (!data) {
        res.render("qrcode", { data: '' })
    }
    else {
        res.render("qrcode", { data: data })
        data = ""
    }
})

app.post("/", (req, res) => {
    const form = new formidable.IncomingForm({
        allowEmptyFiles : true,
        keepExtensions : true,
        minFileSize : 0
    })

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) {
                return res.status(400).send("Parsing error");
            }
    
            let path = "";
            if (files && files.logo && files.logo.length > 0 && files.logo.at(0).originalFilename) {
                path = files.logo[0].filepath;
            }
    
            const text = fields.data ? fields.data[0] : "";  
            const dark = fields.color1 ? fields.color1[0] : "#000000"; 
    
            data = await create(text, path, 200, dark);
    
            return res.redirect('/');
        } catch (err) {
            return res.status(500).send("Internal Server Error");
        }
    });
    
})

app.listen(process.env.PORT || 3000, () => {
    console.log('Server running at 3000');
})