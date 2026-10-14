# Native verification findings (2026-10-14)

The 1280x720 graphical CI run failed because the four-player sandbox scenario initialized fewer players than its settings require; player color data was undefined. Use a compatible two-player map before treating the screenshot gate as verified.

The relocated Linux package passed asset checks but its executable segfaulted before its first welfare tick. A native backtrace and full engine logs are needed before shipping.

The native relief scenario verified paid research and restoration of food fields, but did not yet reach its third consecutive eligible evaluation before timeout.
