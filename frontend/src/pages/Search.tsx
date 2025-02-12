import SearchStudent from '../components/Search/SearchStudent';
import Searchall from '../components/Search/SearchAllStudents';
import "../styles/search.css"
import Scholarship from '../components/Search/Scholarship';

const Search: React.FC = () => {

  return (
    <div>

      <div>
        <div className='global-container'>
          <SearchStudent/>
        </div>
        <div className='global-container'>
          <Searchall/>
        </div>
        <div className='global-container'>
          <Scholarship/>
        </div>
      </div>
      
    </div>
  );
};

export default Search;

