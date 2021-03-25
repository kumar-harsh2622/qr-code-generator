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

async function create(dataForQRcode, center_image, width, cwidth, color) {
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
    const img = await loadImage(center_image);
    const center = (canvas.width / 2) - (cwidth / 2);
    ctx.drawImage(img, center, center, cwidth, cwidth);
    return canvas.toDataURL("image/png");
}
app.get("/", (req, res) => {
    if (!data) res.render("qrcode", { data: '' })
    else {
        res.render("qrcode", { data: data })
    }
})
app.post("/", (req, res) => {
    const form = new formidable.IncomingForm()
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log(err);
        } else {
            var text = fields.data
            var dark = fields.color1
            data = await create(text, __dirname + "/public/images/logo.jpg", 150, 50, dark)
            res.redirect('/')
        }
    })
})
app.listen(3000, () => {
    console.log('Server running at 3000');
})