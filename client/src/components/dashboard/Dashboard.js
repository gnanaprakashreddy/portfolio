import React,{Fragment, useEffect} from 'react'
import PropTypes from 'prop-types'
import {Link} from 'react-router-dom';
import Spinner from '../layout/Spinner'
import {connect} from 'react-redux'
import DashboardActions from './DashboardActions';
import {getCurrentProfile} from '../../actions/profile'

const Dashboard = ({getCurrentProfile, auth:{user}, profile :{loading , profile}}) => {
    useEffect(()=>{
        getCurrentProfile()
    },[getCurrentProfile])

    return loading && profile === null ? <Spinner /> : <Fragment>
        <h1 className="large text-primary">Dashboard</h1>
        <p className="lead">
            <i className="fa fa-user">{" "}</i> Welcome {user && user.name}
        </p>
        {profile !== null?(<Fragment>
            <DashboardActions />
        </Fragment>):(<Fragment>
            <p>Profile is not yet updated</p>
            <Link to='/create-profile' className="btn btn-primary my-1"> Create Profile </Link>
            </Fragment>)
        }   
    </Fragment>
}

Dashboard.propTypes = {
    getCurrentProfile : PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired
}

const mapStateToProps = state =>({
    auth: state.auth,
    profile: state.profile
})

export default connect(mapStateToProps,{getCurrentProfile})(Dashboard);
