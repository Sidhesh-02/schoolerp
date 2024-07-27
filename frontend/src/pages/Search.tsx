import StudentsInfoDownload from '../components/StudentsInfoDownload';
import SearchStudent from '../components/SearchStudent';
import Searchall from '../components/Searchall';
import "../styles/search.css"

const Search: React.FC = () => {

  return (
    <div className='global-container'>

      <div>
        <StudentsInfoDownload/>
        <SearchStudent/>
        <Searchall/>
      </div>
      
    </div>
  );
};

export default Search;

