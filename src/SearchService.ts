import "react-datepicker/dist/react-datepicker.css";
import 'isomorphic-fetch';
import { EODAG_SERVER_ADRESS } from './config'
import StorageService from './StorageService'

class SearchService {
  /**
   * @param date A Date object
   * @returns a string like YYYY-MM-DD
   */
  formatDate (date) {
    if (date instanceof Date) {
      var local = new Date(date);
      local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return local.toJSON().slice(0, 10);
    }
    return date
  }
  
  /**
   * This methods internaly uses the StorageService to retrieve form data
   * @param page The page to fetch
   * @returns the URL to fetch from the EODAG server to get products
   */
  getSearchURL (page = 1) {
    const { productType, startDate, endDate, cloud } = StorageService.getFormValues();
    const { lonMin, latMin, lonMax, latMax } = StorageService.getExtent();
    let url = `${EODAG_SERVER_ADRESS}/${productType}/?box=${lonMin},${latMin},${lonMax},${latMax}&cloudCover=${cloud}&page=${page}`
    if (startDate) {
      url += `&dtstart=${this.formatDate(startDate)}`
    }
    if (endDate) {
      url += `&dtend=${this.formatDate(endDate)}`
    }
    return url
  }

  /**
   * Contact the EODAG server to retrieve products
   * This methods internaly uses the StorageService to retrieve form data
   * @param page The page to fetch
   * @return a promise that will receive features
   */
  search(page = 1) {
    const url = this.getSearchURL(page)
    return fetch(url).then((response) => {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      }
      return response.json();
    })
  }
}

export default new SearchService();