import fetch from 'node-fetch';
import cheerio from 'cheerio';
import fs from 'fs';
import util from 'util';

const page = Math.floor(Math.random() * 40) + 1; // not sure about this, but she has ~40 pages of reviews
const apiUrl = `https://www.goodreads.com/review/list/1151637-roxane?page=${page}&shelf=read`;

const fetchData = async () => {
  try {
    const response = await fetch(apiUrl);

    // Check if the request was successful (status code in the range 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const textData = await response.text();
    return textData;
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
};


const readFileAsync = util.promisify(fs.readFile);
// for testing purposes in case i get rate limited
const readData = async () => {
  try {
    const content = await readFileAsync('./data.html', 'utf-8');
    return content;
  } catch (err) {
    console.error('Error reading HTML file:', err);
    throw err;
  }
}

const formatName = (inputString) => {
  const [lastName, firstName] = inputString.split(',').map(part => part.trim());
  const formattedName = `${firstName} ${lastName}`;

  return formattedName;
}

const buildLibbyUrl = (title) => {
  const encodedQuery = encodeURIComponent(title);
  const url = `https://libbyapp.com/search/toronto/search/query-${encodedQuery}/page-1`
  return url;
}

const parseData = (htmlText) => {
  const $ = cheerio.load(htmlText);
  const reviews = [];
  $('.bookalike.review').each((index, element) => {
    const title = $(element).find('.field.title .value a').attr('title');
    const author = $(element).find('.field.author .value a').text().trim();
    const isbn = $(element).find('.field.isbn .value').text().trim();
    const avg_rating = $(element).find('.field.avg_rating .value').text().trim();
    const review = $(element).find('[id^="freeTextreview"]').text();

    const data = {
      title: title,
      author: formatName(author),
      isbn: isbn,
      avg_rating: avg_rating,
      review: review,
      libby_url: buildLibbyUrl(title),
    }
    
    reviews.push(data);
  });
  return reviews;
}

fetchData().then(data => {
  const reviews = parseData(data);
  console.log(reviews);
});