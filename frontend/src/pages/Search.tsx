import StudentsInfoDownload from '../components/Student/RetriveStudentExcel';
import SearchStudent from '../components/Search/SearchStudent';
import Searchall from '../components/Search/SearchAllStudents';
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

