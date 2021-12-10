// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: magic;

// CheerLights - Synchronized lights to one color
// https://cheerlights.com/
//
// Special thanks to Anil Patro (https://github.com/anilkpatro)

// The size of the widget preview in the app - "small", "medium" or "large"
const widgetPreview = "small";

// Widget Settings
const cheerlightsSettings = {
  // Number of recent cheerlight colors to show
  numberOfRecents: 7,
  
  // Show the created time
  showCreated: true,
  
  // URL to redirect when widget is clicked on
  url: "https://cheerlights.com/live/"
};

async function run() {
  let widget = new ListWidget();
  widget.setPadding(15, 15, 15, 15);
  widget.url = cheerlightsSettings.url;

  const cheerlightsData = await getCheerlightsData(cheerlightsSettings.numberOfRecents + 1);
  console.log(cheerlightsData);

  const recent = cheerlightsData[cheerlightsData.length - 1];
  const cheerlightsColor = new Color(recent.field2);

  widget.backgroundColor = cheerlightsColor;

  // per ITU-R BT.709
  const luma = 0.2126 * Math.round(cheerlightsColor.red * 255)
    + 0.7152 * Math.round(cheerlightsColor.green * 255)
    + 0.0722 * Math.round(cheerlightsColor.blue * 255);

  let textColor = Color.white();
  if (luma > 180) {
    textColor = Color.black();
  }

  const header = widget.addText('Cheerlights'.toUpperCase());
  header.textColor = textColor;
  header.font = Font.regularSystemFont(12);
  header.minimumScaleFactor = 0.50;

  const wordLevel = widget.addText(recent.field1);
  wordLevel.textColor = textColor;
  wordLevel.font = Font.semiboldSystemFont(30);
  wordLevel.minimumScaleFactor = 0.3;

  widget.addSpacer(5)

  if (cheerlightsSettings.showCreated) {
    const createdAt = new Date(recent.created_at).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    const widgetText = widget.addText(`Created ${createdAt}`);
    widgetText.textColor = textColor;
    widgetText.font = Font.regularSystemFont(9);
    widgetText.minimumScaleFactor = 0.6;
  }

  widget.addSpacer()

  if (cheerlightsSettings.numberOfRecents > 0) {

    const recentStack = widget.addStack()
    recentStack.layoutHorizontally()
    recentStack.setPadding(0, 0, 5, 0)
    recentStack.spacing = 5
    for (let i = cheerlightsData.length - 2; i >= 0; --i) {
      const feed = cheerlightsData[i];
      const color = new Color(feed.field2)

      recentStack.addImage(getColorImage(color, textColor));
    }
  }

  Script.setWidget(widget);
  if (config.runsInApp) {
    if (widgetPreview === "small") { widget.presentSmall(); }
    else if (widgetPreview === "medium") { widget.presentMedium(); }
    else if (widgetPreview === "large") { widget.presentLarge(); }
  }
  Script.complete();
}

/**
 * Fetch cheerlights data
 * 
 * @param {number} num
 * @returns {Promise<CheerlightsData>}
 */
async function getCheerlightsData(num) {
  const req = "http://api.thingspeak.com/channels/1417/feed.json?results=" + num
  let json = await new Request(req).loadJSON()
  return json.feeds
}

/**
 * Draws a circle with a border
 * 
 * @param {Color} color
 * @param {Color} bgColor
 */
function getColorImage(color, bgColor) {
  const drawing = new DrawContext();
  drawing.respectScreenScale = true;
  const size = 60;
  drawing.size = new Size(size, size);
  drawing.opaque = false;

  drawing.setFillColor(bgColor);
  drawing.fillEllipse(new Rect(0, 0, size, size));

  drawing.setFillColor(color);
  drawing.fillEllipse(new Rect(5, 5, size - 10, size - 10));

  const currentDayImg = drawing.getImage();
  return currentDayImg;
}

await run()
