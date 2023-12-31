import React, { FC, useContext, useState } from "react";
import {
	Box,
	Heading,
	Input,
	Textarea,
	FormControl,
	FormLabel,
	Divider,
	Center,
	HStack,
	NumberInput,
	NumberInputField,
	IconButton,
} from "@chakra-ui/react";
import DayPickerInput from "react-day-picker/DayPickerInput";
import "react-day-picker/lib/style.css";
import { StateContext } from "../state/state";
import {
	FormikHelpers,
	useFormikContext,
	useField,
	Formik,
	Form,
	FormikProps,
} from "formik";
import { createEvent, getUser, updateEvent } from "../api";
import { Redirect, useHistory } from "react-router-dom";
import { setUser } from "../state/actions";
type Values = {
	header: string;
	description: string;
	minute: number;
	hour: number;
	date: Date;
};
import { ArrowBackIcon } from "@chakra-ui/icons";

export const DatePickerField = ({
	...props
}: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[x: string]: any;
	name: string;
}): JSX.Element => {
	const { setFieldValue } = useFormikContext();
	const [field] = useField(props);
	return (
		<DayPickerInput
			{...field}
			{...props}
			value={(field.value && new Date(field.value)) || null}
			onDayChange={(val) => {
				setFieldValue(field.name, val);
			}}
		/>
	);
};

const Event: FC = () => {
	const { state, dispatch } = useContext(StateContext);
	const { user, currentEvent } = state;
	const history = useHistory();
	const [statusMessage, setStatusMessage] = useState<string>("");

	if (!user) return <Redirect to={"/"} />;

	const parseTime = (hours: number, minutes: number): string => {
		const minuteFixed = minutes < 10 ? "0" + minutes : minutes;
		const hourFixed = hours < 10 ? "0" + hours : hours;
		return hourFixed + ":" + minuteFixed;
	};

	const parseDate = (date: Date): string => {
		const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		return year + "-" + month + "-" + day;
	};

	const submitValues = async (values: Values) => {
		const eventObj = {
			header: values.header,
			description: values.description,
			date: parseDate(values.date),
			time: parseTime(values.hour, values.minute),
		};

		if (currentEvent && currentEvent.id) {
			const response = await updateEvent(
				user.username,
				currentEvent.id,
				eventObj
			);
			if (response) {
				setStatusMessage("Event updated");
				const reqUser = await getUser(user.username);
				if (reqUser) {
					dispatch(setUser(reqUser));
					history.push("/calendar");
				} else setStatusMessage("Failed to update user, please relogin");
			} else setStatusMessage("Failed to update event, please try again");
		} else {
			const response = await createEvent(user.username, eventObj);
			if (response) {
				setStatusMessage("Event created");
				const reqUser = await getUser(user.username);
				if (reqUser) {
					dispatch(setUser(reqUser));
					history.push("/calendar");
				} else setStatusMessage("Failed to update user, please relogin");
			} else setStatusMessage("Failed to update event, please try again");
		}
	};

	return (
		<Box w="50%" ml="auto" mr="auto">
			<IconButton
				aria-label="return button"
				icon={<ArrowBackIcon />}
				onClick={() => history.goBack()}
				w="10%"
				marginTop="10px"
			/>
			<Heading textAlign="center">Opprett en ny hendelse</Heading>
			<Formik
				initialValues={{
					header: currentEvent ? currentEvent.header : "",
					description: currentEvent ? currentEvent.description : "",
					date: currentEvent ? new Date(currentEvent.date) : new Date(),
					hour: currentEvent
						? Number(currentEvent.timeString.substr(0, 2))
						: 12,
					minute: currentEvent
						? Number(currentEvent.timeString.substr(3, 5))
						: 30,
				}}
				onSubmit={(
					values: Values,
					{ setSubmitting }: FormikHelpers<Values>
				) => {
					setTimeout(() => {
						submitValues(values);
						setSubmitting(false);
					}, 500);
				}}
			>
				{/*eslint-disable-next-line @typescript-eslint/no-explicit-any */}
				{(props: FormikProps<any>) => (
					<Form>
						<FormControl isRequired>
							<FormLabel>Overskrift</FormLabel>
							<Input
								value={props.values.header}
								onChange={props.handleChange}
								type="text"
								variant="filled"
								name="header"
							/>
						</FormControl>

						<FormControl isRequired>
							<FormLabel>Beskrivelse</FormLabel>
							<Textarea
								value={props.values.description}
								onChange={props.handleChange}
								variant="filled"
								name="description"
							/>
						</FormControl>

						<FormControl isRequired>
							<FormLabel>Dato</FormLabel>
							<DatePickerField
								value={props.values.date}
								onChange={props.handleChange}
								name="date"
							/>
						</FormControl>

						<FormControl isRequired>
							<FormLabel>Tid</FormLabel>
							<HStack>
								<NumberInput
									value={props.values.hour}
									precision={0}
									min={0}
									max={24}
									w={20}
									variant="filled"
								>
									<NumberInputField
										name="hour"
										value={props.values.hour}
										onChange={props.handleChange}
									/>
								</NumberInput>

								<NumberInput
									value={props.values.minute}
									precision={0}
									min={0}
									max={60}
									w={20}
									variant="filled"
								>
									<NumberInputField
										name="minute"
										value={props.values.minute}
										onChange={props.handleChange}
									/>
								</NumberInput>
							</HStack>
						</FormControl>
						<Divider w="90%" m={5} ml="auto" mr="auto" />

						<Center>
							<Input w="30%" type="submit" />
						</Center>
					</Form>
				)}
			</Formik>
			<br />
			<Center> {statusMessage} </Center>
		</Box>
	);
};

export default Event;
