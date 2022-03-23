import {Builder, By} from 'selenium-webdriver';
import edge from 'selenium-webdriver/edge';
import {Country} from "./models/Country";
import {writeFile} from 'fs/promises'

async function main() {
  const countries: Country[] = []
  const options = new edge.Options();
  const service = new edge.ServiceBuilder('./drivers/msedgedriver.exe');
  const driver = new Builder().forBrowser('MicrosoftEdge').setEdgeService(service).setEdgeOptions(options).build();

  // Wikipedia country codes list URL
  await driver.get('https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes');

  // Get table rows
  const rows = await driver.findElements(By.xpath('//*[@id="mw-content-text"]/div[1]/table/tbody/tr'))
  for (const row of rows){
    let countryDataFields = await row.findElements(By.css('td'))

    // Skips the country having only name
    if (countryDataFields.length <= 3)
      continue

    let country = new Country()
    // Gets only second anchor element for take only country name without superscript and subscripts
    let nameField = await countryDataFields[0].findElements(By.css('a'))
    country.name = await nameField[1].getText()
    country.alpha2Code = await countryDataFields[3].getText()
    country.alpha3Code = await countryDataFields[4].getText()
    country.numericCode = Number(await countryDataFields[5].getText())
    countries.push(country)

    // Write data to json file
    await writeFile('countries.json', JSON.stringify(countries))
  }

  await driver.quit();
}

main().then().catch((err) => {
  console.log(err);
})