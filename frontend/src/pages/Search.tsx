import StudentsInfoDownload from '../components/Student/RetriveStudentExcel';
import SearchStudent from '../components/Search/SearchStudent';
import Searchall from '../components/Search/SearchAllStudents';
import "../styles/search.css"
import PhotoUpdate from '../components/Search/PhotoUpdate';
import Scholarship from '../components/Search/Scholarship';

const Search: React.FC = () => {

  return (
    <div className='global-container'>

      <div>
        <StudentsInfoDownload/>
        <hr style={{margin:"30px 0px"}}/>
        <SearchStudent/>
        <hr style={{margin:"30px 0px"}}/>
        <Searchall/>
        <hr style={{margin:"30px 0px"}}/>
        <PhotoUpdate/>
        <hr style={{margin:"30px 0px"}}/>
        <Scholarship/>
      </div>
      
    </div>
  );
};

export default Search;

