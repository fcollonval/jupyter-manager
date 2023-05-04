import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Breadcrumbs,
  Button,
  Checkbox,
  Flash,
  PageLayout,
  FormControl,
  TextInputWithTokens
} from '@primer/react';
import { PageHeader } from '@primer/react/drafts';
import { PersonAddIcon } from '@primer/octicons-react';

const AddUser = (props: {
  addUsers: any;
  updateUsers: any;
  history: any;
}): JSX.Element => {
  const navigate = useNavigate();

  const [currUser, setCurrUser] = useState<string>('');
  const [newUsers, setNewUsers] = React.useState<
    { text: string; id: number }[]
  >([]);
  const [admin, setAdmin] = useState(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  const limit = useSelector(state => state.limit);

  const dispatch = useDispatch();

  const dispatchPageChange = (data: any, page: number) => {
    dispatch({
      type: 'USER_PAGE',
      value: {
        data: data,
        page: page
      }
    });
  };

  const onNewUserRemove = (newUserId: string | number) => {
    setNewUsers(newUsers.filter(newUser => newUser.id !== Number(newUserId)));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const len = newUsers.length;
      setNewUsers(prevUsers => [
        ...prevUsers,
        { text: currUser, id: len ? newUsers[len - 1].id + 1 : 0 }
      ]);
      setCurrUser('');
    }
  };

  const { addUsers, updateUsers } = props;

  const onAddUsers = () => {
    const users: string[] = newUsers.map(user => user.text);
    addUsers(users, admin)
      .then((data: { status: number }) =>
        data.status < 300
          ? updateUsers(0, limit)
              .then((data: any) => dispatchPageChange(data, 0))
              .then(() => navigate('/'))
              .catch(() => setErrorAlert('Failed to update users.'))
          : setErrorAlert(
              `Failed to create user. ${
                data.status === 409 ? 'User already exists.' : ''
              }`
            )
      )
      .catch(() => setErrorAlert('Failed to create user.'));
  };

  return (
    <>
      <PageLayout>
        <PageLayout.Header divider="line">
          <Breadcrumbs>
            <Breadcrumbs.Item href="/#">Home</Breadcrumbs.Item>
            <Breadcrumbs.Item href="/#/add-users" selected>
              Add Users
            </Breadcrumbs.Item>
          </Breadcrumbs>
        </PageLayout.Header>
        <PageLayout.Content>
          <PageHeader>
            <PageHeader.TitleArea>
              <PageHeader.LeadingVisual>
                <PersonAddIcon />
              </PageHeader.LeadingVisual>
              <PageHeader.Title>Add Users</PageHeader.Title>
            </PageHeader.TitleArea>
          </PageHeader>
          {errorAlert && (
            <Flash sx={{ mt: 4 }} variant="danger">
              {errorAlert}
            </Flash>
          )}
          <FormControl sx={{ mt: 4 }}>
            <FormControl.Label>New User(s)</FormControl.Label>
            <TextInputWithTokens
              preventTokenWrapping
              block
              tokens={newUsers}
              onTokenRemove={onNewUserRemove}
              onKeyDown={handleKeyDown}
              value={currUser}
              onChange={e => setCurrUser(e.target.value)}
              placeholder={
                !newUsers.length ? 'Press enter to add a user' : undefined
              }
            />
          </FormControl>
          <FormControl sx={{ mt: 3 }}>
            <Checkbox onChange={() => setAdmin(!admin)} />
            <FormControl.Label>Give Admin Privileges</FormControl.Label>
          </FormControl>
          <PageLayout.Footer divider="line">
            <Button
              variant="primary"
              onClick={onAddUsers}
              disabled={!newUsers.length}
            >
              Add Users
            </Button>
          </PageLayout.Footer>
        </PageLayout.Content>
      </PageLayout>
    </>
  );
};

AddUser.propTypes = {
  addUsers: PropTypes.func,
  updateUsers: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func
  })
};

export default AddUser;
