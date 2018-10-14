// libs
import jwt from 'jsonwebtoken'
import httpStatus from 'http-status'
import getOr from 'lodash/fp/getOr'

// src
import {
    findOne,
    listAll,
    findById,
    createOne,
    destroy,
    update,
} from '../utils'
import config from '../../config/config'

function createSchool(req, res, next) {
    const {
        username,
        password,
        name,
        address,
        phone_no,
        lat = null,
        lng = null,
    } = getOr({}, 'body')(req)

    return findOne('User', { username, password }).then(resUser => {
        if (!resUser) {
            const token = jwt.sign({ username }, config.jwtSecret)
            const user = { username, password, type: 2, token }
            const school = { address, name, phone_no, lat, lng }
            return createOne('User', user)
                .then(savedUser => {
                    const { dataValues } = savedUser
                    const { id, username } = dataValues
                    return createOne('School', {
                        school_id: id,
                        ...school,
                    }).then(savedSchool => {
                        const { dataValues: schoolValues } = savedSchool
                        return res
                            .status(200)
                            .json({
                                username,
                                ...schoolValues,
                            })
                            .catch(err => {
                                destroy('User', { id })
                                return next(e)
                            })
                    })
                })
                .catch(e => next(e))
        }

        return res.status(302).json({ message: 'School Already Exists' })
    })
}

function deleteSchool(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return destroy('School', { school_id: id }).then(() => {
        return destroy('User', { id }).then(() =>
            res.status(200).json({ message: 'School Deleted' }),
        )
    })
}

function updateSchoolDetails(req, res, next) {
    const newData = getOr({}, 'body')(req)
    const { id } = getOr({}, 'params')(req)
    return update('School', { school_id: id }, newData).then(school =>
        res.status(200).json(school),
    )
}

function getSchool(req, res, next) {
    const { id } = getOr({}, 'params')(req)
    return findOne('School', { school_id: id }).then(school =>
        res.status(200).json(school),
    )
}

function schoolList(req, res, next) {
    return listAll('School').then(school => res.status(200).json(school))
}

export default {
    getSchool,
    schoolList,
    createSchool,
    updateSchoolDetails,
    deleteSchool,
}
