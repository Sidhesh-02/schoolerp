import SearchStudent from '../components/Search/SearchStudent';
import Searchall from '../components/Search/SearchAllStudents';
import "../styles/search.css"
import Scholarship from '../components/Search/Scholarship';

const Search: React.FC = () => {

  return (
    <div className='global-container'>

      <div>
        <SearchStudent/>
        <hr style={{margin:"30px 0px"}}/>
        <Searchall/>
        <hr style={{margin:"30px 0px"}}/>
        <Scholarship/>
      </div>
      
    </div>
  );
};

export default Search;

